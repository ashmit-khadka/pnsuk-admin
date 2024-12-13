import React from "react";

const FormFieldDate = (props) => {
  const { id, label, register, errors, validation } = props;

  return (
    <div>
      <label>{label}</label>
      <input
        type="date"
        {...register(id, validation)}
      />
      {errors[id] && <span>{errors[id].message}</span>}
    </div>
  );
};

export default FormFieldDate;