import { useState, useRef } from "react";
import registerConfig from "./register.config.json";
import "../styles/theme.css";
import { Link, useNavigate } from "react-router-dom";

type AuthStep = "REGISTER" | "OTP";

export default function Register() {
  const { leftSection, otpForm, header, form, checkbox, primaryButton, footerText } = registerConfig;
  const [authStep, setAuthStep] = useState<AuthStep>("REGISTER");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  
  // OTP State and Refs
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStep("OTP");
  };

  const handleVerifyOtp = () => {
    navigate('/workspace-setup');
  };

  // OTP Handlers
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasteData.some((char) => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus either the last filled index or the end
    const submitIndex = Math.min(pasteData.length, 5);
    inputRefs.current[submitIndex]?.focus();
  };

  return (
    <div className="register-page-container" id="register-page-container">
      {/* Left Section - Image Panel */}
      <div className="register-left-panel" id="register-left-panel">
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
      {/* Right Section - Conditional Rendering */}
      <div className="register-right-panel" id="register-right-panel">
        {authStep === "REGISTER" ? (
          // REGISTER FORM
          // REGISTER FORM
          <div className="register-form-container" id="register-form-container">
            {/* Header */}
            <div className="register-form-header">
              <h2 className="register-form-title">{header.title.text}</h2>
              <div className="register-form-subtitle">
                {header.subtitle.text}
                <span className="highlight-text">{header.subtitle.highlight.text}</span>
              </div>
            </div>

            {/* Form Fields */}
            {/* Form Fields */}
            <form onSubmit={handleCreateAccount} id="register-form">
              <div className="register-input-group">
                {form.fields.map((field: any, index: number) => {
                  if (field.row) {
                    return (
                      <div key={index} className="register-input-row">
                        {field.row.map((subField: any, subIndex: number) => (
                          <div key={subIndex} className="register-input-wrapper half-width">
                              <input
                                id={`register-input-${subField.name}`}
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
                          id={`register-select-${field.name}`}
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
                        id={`register-input-${field.name}`}
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
                <input type="checkbox" className="register-checkbox" id="register-terms" />
                <label htmlFor="register-terms">
                  {checkbox.label.replace(checkbox.linkText, "")}
                  <a href="#" className="register-link">{checkbox.linkText}</a>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="register-btn-primary" id="register-submit-btn">
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
          // OTP FORM
          <div 
            id="otp-form-container"
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
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  className="otp-input-box"
                  value={digit}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
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
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              {otpForm.resendText.text.replace(otpForm.resendText.highlight.text, "")}
              <span style={{ fontWeight: otpForm.resendText.highlight.weight }}>
                {otpForm.resendText.highlight.text}
              </span>
            </div>

            <button 
              id="otp-verify-btn"
              className="otp-verify-btn"
              onClick={handleVerifyOtp}
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
