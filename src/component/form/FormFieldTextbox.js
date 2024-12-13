import React from "react";

const FormFieldTextbox = (props) => {
  const { id, label, placeholder, register, errors, validation } = props;

  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        {...register(id, validation)}
      />
      {errors[id] && <span>{errors[id].message}</span>}
    </div>
  );
};

export default FormFieldTextbox;