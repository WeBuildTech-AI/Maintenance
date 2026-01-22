import { useState } from "react";
import workspaceConfig from "./postVerifyWorkspaceSetup.ui.json";
import "../styles/theme.css";

type Step = "step1" | "step2" | "step3" | "step4" | "step5";

export default function WorkspaceSetup() {
  const { page, steps, progressBar, form, sectionDivider, twoColumnRow, textarea, uploadBox, footerActions } = workspaceConfig;
  const [currentStep, setCurrentStep] = useState<Step>("step1");
  
  const stepConfig = steps[currentStep];
  const currentProgress = stepConfig.progress;
  const currentHeader = stepConfig.header;

  const handleNext = () => {
    if (currentStep === "step1") {
      setCurrentStep("step2");
    } else if (currentStep === "step2") {
      setCurrentStep("step3");
    } else if (currentStep === "step3") {
      setCurrentStep("step4");
    } else if (currentStep === "step4") {
      setCurrentStep("step5");
    }
  };

  const handlePrevious = () => {
    if (currentStep === "step2") {
      setCurrentStep("step1");
    } else if (currentStep === "step3") {
      setCurrentStep("step2");
    } else if (currentStep === "step4") {
      setCurrentStep("step3");
    } else if (currentStep === "step5") {
      setCurrentStep("step4");
    }
  };

  const getLeftButtonText = () => {
    switch (currentStep) {
      case "step1": return "New Location";
      case "step2": return "New Production Line";
      case "step3": return "New Location";
      case "step4": return "New Meter";
      case "step5": return "New User";
      default: return "New Location";
    }
  };
  
  return (
    <div 
      id="workspace-setup-page"
      className="workspace-setup-container"
      style={{ backgroundColor: page.backgroundColor }}
    >
      {/* FIXED HEADER */}
      <div 
        id="workspace-header"
        className="workspace-setup-header"
        style={{
          paddingTop: page.padding.top,
          paddingLeft: page.padding.left,
          paddingRight: page.padding.right
        }}
      >
        {/* Progress Bar */}
        <div id="workspace-progress-bar" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: progressBar.marginBottom 
        }}>
          {/* Logo */}
          <img 
            src={progressBar.logo} 
            alt="Logo" 
            style={{ height: '32px', width: 'auto' }}
          />
          
          {/* Progress Bar Container */}
          <div style={{ 
            flex: 1,
            height: progressBar.height, 
            backgroundColor: progressBar.backgroundColor, 
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative"
          }}>
            <div style={{ 
              width: currentProgress, 
              height: "100%", 
              backgroundColor: progressBar.fillColor,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Percentage */}
          {progressBar.showPercentage && (
            <span style={{
              fontFamily: progressBar.percentageFontFamily,
              fontSize: progressBar.percentageFontSize,
              fontWeight: progressBar.percentageFontWeight,
              color: progressBar.percentageColor
            }}>
              {currentProgress}
            </span>
          )}
        </div>

        {/* Header */}
        <h1 style={{ 
          fontFamily: currentHeader.title.fontFamily,
          fontSize: currentHeader.title.fontSize,
          fontWeight: currentHeader.title.fontWeight,
          letterSpacing: currentHeader.title.letterSpacing,
          color: currentHeader.title.color,
          textAlign: currentHeader.title.textAlign as any,
          marginBottom: currentHeader.title.marginBottom,
          margin: `0 0 ${currentHeader.title.marginBottom} 0`
        }}>
          {currentHeader.title.text}
        </h1>
        <p style={{ 
          fontFamily: currentHeader.subtitle.fontFamily,
          fontSize: currentHeader.subtitle.fontSize,
          fontWeight: currentHeader.subtitle.fontWeight,
          letterSpacing: currentHeader.subtitle.letterSpacing,
          color: currentHeader.subtitle.color,
          textAlign: currentHeader.subtitle.textAlign as any,
          marginBottom: currentHeader.subtitle.marginBottom,
          margin: `0 0 ${currentHeader.subtitle.marginBottom} 0`
        }}>
          {currentHeader.subtitle.text}
        </p>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div 
        id="workspace-content"
        className="workspace-setup-content"
        style={{
          paddingLeft: page.padding.left,
          paddingRight: page.padding.right
        }}
      >
        {/* Form Container */}
        <div style={{ 
          display: form.container.display, 
          flexDirection: form.container.flexDirection as any, 
          gap: form.container.gap,
          maxWidth: page.width,
          margin: '0 auto' 
        }}>
          
          {/* Conditional Form Rendering Based on Step */}
          {currentStep === "step1" && (
            <>
              {/* Company Name */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Company name<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-company-name"
                  type="text" 
                  placeholder="Enter Company name" 
                  style={form.input} 
                />
              </div>

              {/* Industry */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Industry<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-industry"
                  type="text" 
                  placeholder="Enter Location Name" 
                  style={form.input} 
                />
              </div>

               {/* Head Quarter */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Head Quarter<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-head-quarter"
                  type="text" 
                  placeholder="Enter City" 
                  style={form.input} 
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Address<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-address"
                  type="text" 
                  placeholder="Enter Address" 
                  style={form.input} 
                />
              </div>

              {/* Section Divider */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: sectionDivider.marginTop, 
                marginBottom: sectionDivider.marginBottom 
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
                <span style={{ 
                  padding: '0 16px', 
                  color: sectionDivider.lineColor, 
                  fontWeight: 600, 
                  fontFamily: 'Montserrat' 
                }}>
                  Location
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
              </div>

              {/* Two Column Row - Factory & Address */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Factory<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-factory-name" type="text" placeholder="Enter Factory Name" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Address<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-factory-address" type="text" placeholder="Enter Address" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

               {/* Description */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Description</label>
                <input 
                  id="workspace-description"
                  type="text" 
                  placeholder="Add Description" 
                  style={{ ...form.input, ...textarea }} 
                />
              </div>

              {/* Add Image - Upload Box */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Add Image</label>
                <div 
                  id="workspace-image-upload"
                  style={{ 
                  height: uploadBox.height, 
                  border: uploadBox.border, 
                  borderRadius: uploadBox.borderRadius, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#FFF9EE'
                }}>
                  <span style={{ 
                    fontFamily: uploadBox.fontFamily, 
                    fontSize: uploadBox.fontSize, 
                    color: uploadBox.color 
                  }}>
                    Add or drag image
                  </span>
                </div>
              </div>
            </>
          )}

          {currentStep === "step2" && (
            <>
              {/* Section Divider - Production Line */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '0px', 
                marginBottom: sectionDivider.marginBottom 
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
                <span style={{ 
                  padding: '0 16px', 
                  color: sectionDivider.lineColor, 
                  fontWeight: 600, 
                  fontFamily: 'Montserrat' 
                }}>
                  Production Line
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
              </div>

              {/* Production Line Name */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Production Line Name<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-production-line-name"
                  type="text" 
                  placeholder="Enter Asset Name" 
                  style={form.input} 
                />
              </div>

              {/* Two Column Row - Line Code/ID & Line Type */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Line Code / ID<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-line-code" type="text" placeholder="Enter Line Code / ID" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Line Type</label>
                   <input id="workspace-line-type" type="text" placeholder="Select Line Type" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Two Column Row - Factory/Sites & Area/Zone */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Factory / Sites<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-factory-site" type="text" placeholder="Select Factory" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Area / Zone<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-area-zone" type="text" placeholder="Select Area / Zone" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Two Column Row - Operation Status & Primary Output */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Operation Status</label>
                   <input id="workspace-operation-status" type="text" placeholder="Select Status" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Primary Output</label>
                   <input id="workspace-primary-output" type="text" placeholder="Enter Primary Output" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Two Column Row - Designed Capacity & Line Criticality */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Designed Capacity</label>
                   <input id="workspace-designed-capacity" type="text" placeholder="Units / Hour" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Line Criticality<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-line-criticality" type="text" placeholder="Select Criticality" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Regulatory Standards & Responsible Department */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Regulatory Standards</label>
                   <div id="workspace-regulatory-standards" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <input id="workspace-regulatory-iso" type="checkbox" /> ISO
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <input id="workspace-regulatory-gmp" type="checkbox" /> GMP
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <input id="workspace-regulatory-fda" type="checkbox" /> FDA
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <input id="workspace-regulatory-ce" type="checkbox" /> CE
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <input id="workspace-regulatory-custom" type="checkbox" /> Custom
                     </label>
                   </div>
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Responsible Department<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-responsible-department" type="text" placeholder="Select Department" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Lockout/Tagout Required */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Lockout/Tagout Required?</label>
                <div id="workspace-lockout-required" style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input id="workspace-lockout-yes" type="radio" name="lockout" /> Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input id="workspace-lockout-no" type="radio" name="lockout" /> No
                  </label>
                </div>
              </div>

              {/* Add File - Upload Box */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Add File</label>
                <div 
                  id="workspace-production-line-file-upload"
                  style={{ 
                  height: uploadBox.height, 
                  border: uploadBox.border, 
                  borderRadius: uploadBox.borderRadius, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#FFF9EE'
                }}>
                  <span style={{ 
                    fontFamily: uploadBox.fontFamily, 
                    fontSize: uploadBox.fontSize, 
                    color: uploadBox.color 
                  }}>
                    {uploadBox.text}
                  </span>
                </div>
              </div>
            </>
          )}

          {currentStep === "step3" && (
            <>
              {/* Section Divider - Asset */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '0px', 
                marginBottom: sectionDivider.marginBottom 
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
                <span style={{ 
                  padding: '0 16px', 
                  color: sectionDivider.lineColor, 
                  fontWeight: 600, 
                  fontFamily: 'Montserrat' 
                }}>
                  Asset
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
              </div>

              {/* Two Column Row - Asset Name & Factory */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Asset Name<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-name" type="text" placeholder="Enter Asset Name" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Factory<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-factory" type="text" placeholder="Select Factory" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Description</label>
                <input 
                  id="workspace-asset-description"
                  type="text" 
                  placeholder="Add Description" 
                  style={{ ...form.input, ...textarea }} 
                />
              </div>

              {/* Two Column Row - Criticality & Year */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Criticality<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-criticality" type="text" placeholder="Select Criticality" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Year<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-year" type="text" placeholder="Enter Year of" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Two Column Row - Manufacturer & Serial Number */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Manufacturer<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-manufacturer" type="text" placeholder="Enter Manufacturer" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Serial Number<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-serial-number" type="text" placeholder="Enter Serial Number" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Two Column Row - Asset Types */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Asset Types ( Production Line )<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-type-production" type="text" placeholder="Select Asset Types" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Asset Types ( Utility )<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-asset-type-utility" type="text" placeholder="Select Asset Types" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Add File - Upload Box */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Add File</label>
                <div 
                  id="workspace-asset-file-upload"
                  style={{ 
                  height: uploadBox.height, 
                  border: uploadBox.border, 
                  borderRadius: uploadBox.borderRadius, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#FFF9EE'
                }}>
                  <span style={{ 
                    fontFamily: uploadBox.fontFamily, 
                    fontSize: uploadBox.fontSize, 
                    color: uploadBox.color 
                  }}>
                    {uploadBox.text}
                  </span>
                </div>
              </div>
            </>
          )}

          {currentStep === "step4" && (
            <>
              {/* Section Divider - Meters */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '0px', 
                marginBottom: sectionDivider.marginBottom 
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
                <span style={{ 
                  padding: '0 16px', 
                  color: sectionDivider.lineColor, 
                  fontWeight: 600, 
                  fontFamily: 'Montserrat' 
                }}>
                  Meters
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
              </div>

              {/* Two Column Row - Meter Name & Assets */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Meter Name<span style={{color:'red'}}>*</span></label>
                   <input id="workspace-meter-name" type="text" placeholder="Enter Meter Name" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Assets</label>
                   <input id="workspace-meter-asset" type="text" placeholder="Select Asset" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Description<span style={{color:'red'}}>*</span></label>
                <input 
                  id="workspace-meter-description"
                  type="text" 
                  placeholder="Add Description" 
                  style={{ ...form.input, ...textarea }} 
                />
              </div>

              {/* Additional Info - Upload Box */}
               <div>
                <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Additional Info</label>
                <div 
                  id="workspace-meter-file-upload"
                  style={{ 
                  height: uploadBox.height, 
                  border: uploadBox.border, 
                  borderRadius: uploadBox.borderRadius, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#FFF9EE'
                }}>
                  <span style={{ 
                    fontFamily: uploadBox.fontFamily, 
                    fontSize: uploadBox.fontSize, 
                    color: uploadBox.color 
                  }}>
                    Add or drag File
                  </span>
                </div>
              </div>
            </>
          )}

          {currentStep === "step5" && (
            <>
              {/* Section Divider - Invite Users */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '0px', 
                marginBottom: sectionDivider.marginBottom 
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
                <span style={{ 
                  padding: '0 16px', 
                  color: sectionDivider.lineColor, 
                  fontWeight: 600, 
                  fontFamily: 'Montserrat' 
                }}>
                  Invite Users
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: sectionDivider.lineColor, opacity: 0.3 }}></div>
              </div>

              {/* Three Column Row - User, Mobile No, Role */}
              <div style={{ display: 'flex', gap: twoColumnRow.gap }}>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>User</label>
                   <input id="workspace-user-name" type="text" placeholder="Enter User Name" style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Mobile No</label>
                   <input id="workspace-user-mobile" type="text" placeholder="Enter Mobile No." style={{ ...form.input, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ ...form.label, display: 'block', marginBottom: '8px' }}>Role</label>
                   <input id="workspace-user-role" type="text" placeholder="Select Role" style={{ ...form.input, width: '100%' }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div 
        className="workspace-setup-footer"
        style={{
          paddingLeft: page.padding.left,
          paddingRight: page.padding.right,
          paddingBottom: page.padding.bottom,
          paddingTop: '24px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: page.width,
          margin: '0 auto'
        }}>
           <button 
             id="workspace-footer-left-btn"
             style={{ 
             height: footerActions.leftButton.height,
             borderRadius: footerActions.leftButton.borderRadius,
             border: footerActions.leftButton.border,
             backgroundColor: footerActions.leftButton.backgroundColor,
             color: '#FAAD00',
             padding: '0 24px',
             fontFamily: 'Montserrat',
             fontWeight: 600,
             cursor: 'pointer'
           }}>
             + {getLeftButtonText()}
           </button>

           <div style={{ display: 'flex', gap: '16px' }}>
             {currentStep !== "step1" && (
               <button 
                 id="workspace-footer-prev-btn"
                 onClick={handlePrevious}
                 style={{ 
                   height: footerActions.rightButton.height,
                   borderRadius: footerActions.rightButton.borderRadius,
                   backgroundColor: 'transparent',
                   border: '1px solid #FAAD00',
                   color: '#FAAD00',
                   padding: '0 32px',
                   fontFamily: 'Montserrat',
                   fontWeight: 600,
                   cursor: 'pointer'
                 }}
               >
                 {"<"} Previous
               </button>
             )}

             <button 
               id="workspace-footer-next-btn"
               onClick={handleNext}
               style={{ 
                 height: footerActions.rightButton.height,
                 borderRadius: footerActions.rightButton.borderRadius,
                 backgroundColor: footerActions.rightButton.backgroundColor,
                 color: '#FFFFFF',
                 padding: '0 32px',
                 fontFamily: 'Montserrat',
                 fontWeight: 600,
                 border: 'none',
                 cursor: 'pointer'
               }}
             >
               {footerActions.rightButton.text} {">"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
