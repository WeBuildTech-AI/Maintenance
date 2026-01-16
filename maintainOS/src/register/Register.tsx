import { useState } from "react";
import registerConfig from "./register.config.json";
import "./index.css";
import { Link } from "react-router-dom";

export default function Register() {
  const { leftSection, otpForm, header, form, checkbox, primaryButton, footerText } = registerConfig;
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpStep(true);
  };

  return (
    <div className="register-page-container">
      {/* Left Section - Image Panel */}
      <div className="register-left-panel">
        <img 
          src={leftSection.image.src} 
          alt="Maintenance Worker" 
          className="register-bg-image" 
        />
        {leftSection.image.overlay && (
          <div className="register-overlay">
            <h1 className="register-heading-main">{leftSection.content.heading.text}</h1>
            <p className="register-subtext-main">{leftSection.content.subText.text}</p>
          </div>
        )}
      </div>

      {/* Right Section - Conditional Rendering */}
      <div className="register-right-panel">
        {!isOtpStep ? (
          // REGISTER FORM
          <div className="register-form-container">
            {/* Header */}
            <div className="register-form-header">
              <h2 className="register-form-title">{header.title.text}</h2>
              <div className="register-form-subtitle">
                {header.subtitle.text}
                <span className="highlight-text">{header.subtitle.highlight.text}</span>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCreateAccount}>
              <div className="register-input-group">
                {form.fields.map((field: any, index: number) => {
                  if (field.row) {
                    return (
                      <div key={index} className="register-input-row">
                        {field.row.map((subField: any, subIndex: number) => (
                          <div key={subIndex} className="register-input-wrapper half-width">
                            <input
                              type={subField.type}
                              name={subField.name}
                              placeholder={subField.placeholder}
                              className="register-input"
                              value={formData[subField.name] || ""}
                              onChange={handleChange}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (field.type === "select") {
                    return (
                      <div key={index} className="register-input-wrapper">
                        <select
                          name={field.name}
                          className="register-input register-select"
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                        >
                          <option value="" disabled>{field.placeholder}</option>
                          {field.options && field.options.map((opt: string, i: number) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="register-input-wrapper">
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        className="register-input"
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Checkbox */}
              <div className="register-checkbox-container">
                <input type="checkbox" className="register-checkbox" id="terms" />
                <label htmlFor="terms">
                  {checkbox.label.replace(checkbox.linkText, "")}
                  <a href="#" className="register-link">{checkbox.linkText}</a>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="register-btn-primary">
                {primaryButton.text}
              </button>

              {/* Footer */}
              <div className="register-footer">
                {footerText.text}
                <Link to="/login" className="register-footer-action">
                  {footerText.actionText}
                </Link>
              </div>
            </form>
          </div>
        ) : (
          // OTP FORM
          <div 
            className="otp-form-container"
            style={{ 
              width: otpForm.container.width, 
              padding: otpForm.container.padding,
              textAlign: otpForm.container.alignment as any 
            }}
          >
            <h2 
              className="otp-page-title"
              style={{ 
                fontFamily: otpForm.title.font,
                fontWeight: otpForm.title.weight,
                fontSize: otpForm.title.size,
                lineHeight: otpForm.title.lineHeight,
                letterSpacing: otpForm.title.letterSpacing,
                color: otpForm.title.color,
                marginBottom: otpForm.title.marginBottom
              }}
            >
              {otpForm.title.text}
            </h2>
            
            <p 
              className="otp-page-subtitle"
              style={{ 
                fontFamily: otpForm.subtitle.font,
                fontWeight: otpForm.subtitle.weight,
                fontSize: otpForm.subtitle.size,
                lineHeight: otpForm.subtitle.lineHeight,
                letterSpacing: otpForm.subtitle.letterSpacing,
                color: otpForm.subtitle.color,
                marginBottom: otpForm.subtitle.marginBottom
              }}
            >
              {otpForm.subtitle.text}
            </p>

            <div 
              className="otp-inputs-row"
              style={{ 
                gap: otpForm.otpInputs.gap, 
                marginBottom: otpForm.otpInputs.marginBottom,
                display: 'flex',
                justifyContent: 'center',
                maxWidth: '374px',
                margin: '0 auto'
              }}
            >
              {Array.from({ length: otpForm.otpInputs.count }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="otp-input-box"
                  style={{
                    width: otpForm.otpInputs.box.width,
                    height: otpForm.otpInputs.box.height,
                    borderRadius: otpForm.otpInputs.box.radius,
                    border: otpForm.otpInputs.box.border,
                    fontSize: otpForm.otpInputs.box.fontSize,
                    textAlign: otpForm.otpInputs.box.textAlign as any
                  }}
                />
              ))}
            </div>

            <div 
              className="otp-resend-text"
              style={{ 
                fontFamily: otpForm.resendText.font,
                fontWeight: otpForm.resendText.weight,
                fontSize: otpForm.resendText.size,
                letterSpacing: otpForm.resendText.letterSpacing,
                textAlign: otpForm.resendText.alignment as any,
                marginBottom: otpForm.resendText.marginBottom,
                maxWidth: '374px',
                margin: '0 auto'
              }}
            >
              {otpForm.resendText.text.replace(otpForm.resendText.highlight.text, "")}
              <span style={{ fontWeight: otpForm.resendText.highlight.weight }}>
                {otpForm.resendText.highlight.text}
              </span>
            </div>

            <button 
              className="otp-verify-btn"
              style={{
                width: otpForm.verifyButton.width,
                height: otpForm.verifyButton.height,
                borderRadius: otpForm.verifyButton.radius,
                backgroundColor: otpForm.verifyButton.background,
                opacity: otpForm.verifyButton.opacity,
                fontFamily: otpForm.verifyButton.font,
                fontWeight: otpForm.verifyButton.weight,
                fontSize: otpForm.verifyButton.size,
                color: otpForm.verifyButton.color,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {otpForm.verifyButton.text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
