import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

export const useImageUpload = (totalSlots = 32) => {
  const [slots, setSlots] = useState(
    Array.from({ length: totalSlots }, (_, i) => ({ 
      id: i + 1, 
      file: null, 
      previewUrl: null, 
      supabaseUrl: null 
    }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const activeUrls = useRef(new Set());

  useEffect(() => {
    return () => {
      activeUrls.current.forEach(url => URL.revokeObjectURL(url));
      activeUrls.current.clear();
    };
  }, []);

  const processFiles = useCallback((files) => {
    const imageFiles = Array.from(files).filter(f => f.type === 'image/png');
    if (imageFiles.length === 0) return alert('PNG 형식의 이미지만 업로드 가능합니다.');

    setSlots(prev => {
      const newSlots = [...prev];
      let fileIndex = 0;
      for (let i = 0; i < newSlots.length && fileIndex < imageFiles.length; i++) {
        if (!newSlots[i].file) {
          const file = imageFiles[fileIndex++];
          const url = URL.createObjectURL(file);
          activeUrls.current.add(url);
          newSlots[i] = { ...newSlots[i], file, previewUrl: url };
        }
      }
      return newSlots;
    });
  }, []);

  const removeFile = useCallback((id) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === id && slot.file) {
        if (slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
          activeUrls.current.delete(slot.previewUrl);
        }
        return { ...slot, file: null, previewUrl: null, supabaseUrl: null };
      }
      return slot;
    }));
  }, []);

  const uploadToServer = useCallback(async () => {
    const validUploads = slots.filter(s => s.file !== null);
    if (validUploads.length === 0) return null;
    
    setIsUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user.id;
      const uploadedImagesWithUrls = [];

      for (let i = 0; i < validUploads.length; i++) {
        const slot = validUploads[i];
        const fileName = `${userId}/${Date.now()}_slot${slot.id}.png`;
        
        const { error } = await supabase.storage
            .from('emoticon-images')
            .upload(fileName, slot.file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('emoticon-images')
            .getPublicUrl(fileName);

        uploadedImagesWithUrls.push({
            id: slot.id,
            supabaseUrl: publicUrl
        });
      }
      return uploadedImagesWithUrls;
    } catch (error) {
      console.error(error);
      alert('업로드 중 오류가 발생했습니다. (버킷 이름을 확인하세요: emoticon-images)');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [slots]);

  return { 
    slots, 
    uploadedCount: slots.filter(s => s.file).length, 
    isUploading, 
    processFiles, 
    removeFile, 
    uploadToServer 
  };
};
