import React from "react";
import "./Login.css";

const FormField = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  error,
  required = false,
  options = [],
  half = false
}) => {
  const isSelect = type === "select";
  const className = `form-group ${half ? 'half' : ''} ${error ? 'error' : ''}`;

  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      
      {isSelect ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">{placeholder || "Select"}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      
      {error && <div className="input-feedback">{error}</div>}
    </div>
  );
};

export default FormField; 