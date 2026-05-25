package com.kdj.emoticon_lab.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "emoticon_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmoticonImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Integer slotIndex;

    @Column(nullable = false, length = 500)
    private String supabaseUrl;

    @Builder
    public EmoticonImage(Project project, Integer slotIndex, String supabaseUrl) {
        this.project = project;
        this.slotIndex = slotIndex;
        this.supabaseUrl = supabaseUrl;
    }

    public void updateSupabaseUrl(String supabaseUrl) {
        this.supabaseUrl = supabaseUrl;
    }
}
