import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";


const articleConfig = {
  title: {
    id: "title",
    type: "text",
    placeholder: "Enter title",
    validation: { required: true },
    visible: true,
    defaultValue: "Default Title",
    label: "Title"
  },
  text: {
    id: "text",
    type: "textarea",
    placeholder: "Enter text",
    validation: { required: true },
    visible: true,
    defaultValue: "Default Text",
    label: "Text"
  },
  date: {
    id: "date",
    type: "date",
    placeholder: null,
    validation: { required: true },
    visible: true,
    defaultValue: "",
    label: "Date"
  },
  is_event: {
    id: "is_event",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: false,
    label: "Is Event"
  },
  is_aid: {
    id: "is_aid",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: false,
    label: "Is Aid"
  },
  is_guest: {
    id: "is_guest",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: false,
    label: "Is Guest"
  },
  is_project: {
    id: "is_project",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: false,
    label: "Is Project"
  },
  is_home: {
    id: "is_home",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: true,
    label: "Is Home"
  },
  is_sport: {
    id: "is_sport",
    type: "checkbox",
    placeholder: null,
    validation: null,
    visible: true,
    defaultValue: false,
    label: "Is Sport"
  },
  images: {
    id: "images",
    type: "file",
    placeholder: null,
    validation: { required: true },
    visible: true,
    defaultValue: [],
    label: "Images"
  },
};

const modelConfig = articleConfig;

const getAllItems = async () => {
  const response = await axios.get("http://localhost:3001/articles");
  return response.data;
}

const getDefaultValue = (config) => {
  const defaultValues = {};
  for (const key in config) {
    if (config[key].hasOwnProperty('defaultValue')) {
      defaultValues[key] = config[key].defaultValue;
    }
  }
  return defaultValues;
}

const generateForm = (config, register, errors) => {
  const formFields = [];
  for (const key in config) {
    if (config[key].visible) {
      formFields.push(
        <div key={key}>
          <label>{config[key].label}</label>
          {config[key].type === "textarea" ? (
            <textarea
              placeholder={config[key].placeholder || ""}
              {...register(config[key].id, config[key].validation || {})}
            />
          ) : config[key].type === "file" ? (
            <input
              type={config[key].type}
              multiple
              {...register(config[key].id, config[key].validation || {})}
            />
          ) : (
            <input
              type={config[key].type}
              placeholder={config[key].placeholder || ""}
              {...register(config[key].id, config[key].validation || {})}
            />
          )}
          {errors[key] && <span>{config[key].label} is required</span>}
        </div>
      );
    }
  }
  return formFields;
}

const ImageUpload = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: getDefaultValue(modelConfig)
  });

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields to formData
    for (const key in modelConfig) {
      if (modelConfig[key].type !== "file") {
        formData.append(key, data[key]);
      }
    }

    // Append files to formData
    Array.from(data.images).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log(response.data);
      reset(); // Clear the form after successful submission
    } catch (error) {
      console.error("Error uploading files and text data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {generateForm(modelConfig, register, errors)}
      <button type="submit">Upload</button>
    </form>
  );
};

export default ImageUpload;