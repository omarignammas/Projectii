package org.test.backendprojecty.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.test.backendprojecty.entity.ReportStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusRoomReportResponse {
    private ReportStatus status;
    private String content;
}
