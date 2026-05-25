package com.kdj.emoticon_lab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorDto {
    private Integer slot;
    private String type;
    private String message;
    private Map<String, Integer> coords;
}
