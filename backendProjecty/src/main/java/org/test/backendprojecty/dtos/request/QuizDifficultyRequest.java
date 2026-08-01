package org.test.backendprojecty.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.test.backendprojecty.entity.QuizDifficulty;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDifficultyRequest {

    @NotNull(message = "Difficulty is required")
    private QuizDifficulty difficulty;
}
