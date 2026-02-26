package com.fenpai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:resend}")
    private String fromAddress;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendInvitation(String toEmail, String inviterName, String groupName, String inviteLink) {
        if (mailSender == null || mailPassword.isBlank()) {
            log.warn("RESEND_API_KEY not configured — skipping email to {}", toEmail);
            log.info("[INVITE] {}", inviteLink);
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(inviterName + " 邀請你加入 Fenpai 群組「" + groupName + "」");
            helper.setText(buildEmailHtml(inviterName, groupName, inviteLink), true);
            mailSender.send(message);
            log.info("Invitation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailHtml(String inviterName, String groupName, String inviteLink) {
        return """
            <div style="font-family:'Noto Sans TC',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px">
              <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:#fff;margin:0;font-size:24px">分派 Fenpai</h1>
                <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">台灣分帳神器</p>
              </div>
              <p style="color:#1e293b;font-size:16px;margin:0 0 8px">嗨！</p>
              <p style="color:#334155;font-size:15px;margin:0 0 24px">
                <strong>%s</strong> 邀請你加入分帳群組 <strong>「%s」</strong>。
              </p>
              <a href="%s" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:600;margin-bottom:20px">
                接受邀請
              </a>
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">此連結 7 天內有效</p>
            </div>
            """.formatted(inviterName, groupName, inviteLink);
    }
}
