import React, { useState } from "react";

const FormFieldFile = (props) => {
  const { id, label, register, errors, validation, setSelectedFile } = props;
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        type="file"
        {...register(id, validation)}
        onChange={handleFileChange}
      />
      {errors[id] && <span>{errors[id].message}</span>}
      {previewUrl && (
        <div>
          <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover" />
          <button type="button" onClick={handleDeleteFile}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default FormFieldFile;