import React, { useState, CSSProperties, MouseEvent, FocusEvent, ChangeEvent } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchWithDropdownProps {
  placeholder?: string;
  title?: string;
  dropdownOptions?: string[];
  onSearch?: (value: string) => void;
  onDropdownSelect?: (option: string) => void;
  className?: string;
}

export const SearchWithDropdown: React.FC<SearchWithDropdownProps> = ({
  placeholder = "Start typing...",
  title = "Search",
  dropdownOptions = ["Option 1", "Option 2", "Option 3"],
  onSearch = () => {},
  onDropdownSelect = () => {},

  className = ""
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>(dropdownOptions[0]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleDropdownSelect = (option: string): void => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
    onDropdownSelect(option);
  };

  // Helper function to parse basic className to style object
  const parseClassName = (className: string): CSSProperties => {
    const styles: CSSProperties = {};
    if (className.includes('mb-')) {
      const mbMatch = className.match(/mb-(\d+)/);
      if (mbMatch) styles.marginBottom = `${mbMatch[1] * 4}px`;
    }
    return styles;
  };

  // Inline styles
  const containerStyle: CSSProperties = {
    width: '100%',
    ...parseClassName(className)
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    fontSize: '14px'
  };

  const searchBarStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputContainerStyle: CSSProperties = {
    position: 'relative',
    width: 'calc(100% - 44px)'
  };

  const iconContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    paddingLeft: '12px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: '44px',
    paddingLeft: '36px',
    paddingRight: '16px',
    border: '1px solid #e5e7eb',
    borderTopLeftRadius: '6px',
    borderBottomLeftRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'all 0.15s ease-in-out'
  };

  const inputFocusStyle: CSSProperties = {
    borderColor: '#d1d5db',
    boxShadow: 'none'
  };

  const dropdownButtonStyle: CSSProperties = {
    width: '44px',
    height: '44px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderLeft: 'none',
    borderTopRightRadius: '6px',
    borderBottomRightRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease-in-out'
  };

  const dropdownButtonHoverStyle: CSSProperties = {
    backgroundColor: '#f9fafb'
  };

  const dropdownMenuStyle: CSSProperties = {
    position: 'absolute',
    right: '0',
    top: '100%',
    marginTop: '4px',
    width: '192px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 10
  };

  const dropdownItemStyle: CSSProperties = {
    width: '100%',
    textAlign: 'left',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out'
  };

  const dropdownItemHoverStyle: CSSProperties = {
    backgroundColor: '#f9fafb'
  };

  const chevronStyle: CSSProperties = {
    width: '16px',
    height: '16px',
    color: '#6b7280',
    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s ease-in-out'
  };

  return (
    <div style={containerStyle}>
      {/* Title */}
      <label style={labelStyle}>{title}</label>
      
      {/* Search Bar with Dropdown */}
      <div style={searchBarStyle}>
        {/* Search Input Container */}
        <div style={inputContainerStyle}>
          <div style={iconContainerStyle}>
            <Search style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            style={inputStyle}
            placeholder={placeholder}
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              Object.assign(e.target.style, inputFocusStyle);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        {/* Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={dropdownButtonStyle}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              Object.assign(e.currentTarget.style, dropdownButtonHoverStyle);
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onFocus={(e: FocusEvent<HTMLButtonElement>) => {
              Object.assign(e.currentTarget.style, inputFocusStyle);
            }}
            onBlur={(e: FocusEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ChevronDown style={chevronStyle} />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={dropdownMenuStyle}>
              {dropdownOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleDropdownSelect(option)}
                  style={{
                    ...dropdownItemStyle,
                    borderTopLeftRadius: index === 0 ? '6px' : '0',
                    borderTopRightRadius: index === 0 ? '6px' : '0',
                    borderBottomLeftRadius: index === dropdownOptions.length - 1 ? '6px' : '0',
                    borderBottomRightRadius: index === dropdownOptions.length - 1 ? '6px' : '0'
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    Object.assign(e.currentTarget.style, dropdownItemHoverStyle);
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface QRCodeBarcodeInputProps {
  title?: string;
  placeholder?: string;
  generateText?: string;
  value?: string;
  onChange?: (value: string) => void;
  onGenerate?: () => void;
  className?: string;
}

export const QRCodeBarcodeInput: React.FC<QRCodeBarcodeInputProps> = ({
  title = "QR Code/Barcode",
  placeholder = "Enter or scan code",
  generateText = "Generate Code",
  value = "",
  onChange = () => {},
  onGenerate = () => {},
  className = ""
}) => {
  const [inputValue, setInputValue] = useState<string>(value);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleGenerateClick = (): void => {
    onGenerate();
  };

  // Inline styles to match the exact design
  const containerStyle: CSSProperties = {
    width: '100%',
    marginBottom: '24px'
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    fontSize: '14px'
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: '44px',
    padding: '0 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'all 0.15s ease-in-out'
  };

  const inputFocusStyle: CSSProperties = {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    boxShadow: 'none'
  };

  const generateLinkStyle: CSSProperties = {
    color: '#2563eb',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '400',
    transition: 'color 0.15s ease-in-out'
  };

  const generateLinkHoverStyle: CSSProperties = {
    color: '#1d4ed8',
    textDecoration: 'underline'
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Title */}
      <label style={labelStyle}>{title}</label>
      
      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        style={inputStyle}
        placeholder={placeholder}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          Object.assign(e.target.style, inputFocusStyle);
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.backgroundColor = '#f9fafb';
        }}
      />
      
      {/* Generate Link */}
      <div style={{ marginTop: '6px' }}>
        <span
          onClick={handleGenerateClick}
          style={generateLinkStyle}
          onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
            Object.assign(e.currentTarget.style, generateLinkHoverStyle);
          }}
          onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
            e.currentTarget.style.color = generateLinkStyle.color!;
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          {generateText}
        </span>
      </div>
    </div>
  );
};