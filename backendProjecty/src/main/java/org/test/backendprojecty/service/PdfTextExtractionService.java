package org.test.backendprojecty.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.test.backendprojecty.exception.BadRequestException;

import java.io.IOException;

@Service
public class PdfTextExtractionService {

    public String extractText(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            String text = new PDFTextStripper().getText(document);
            if (text == null || text.isBlank()) {
                throw new BadRequestException(
                        "Couldn't extract any text from this PDF — it may be a scanned image with no selectable text.");
            }
            return text;
        } catch (IOException e) {
            throw new BadRequestException("Couldn't read this PDF file — it may be corrupted or password-protected.");
        }
    }
}
