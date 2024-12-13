import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import { getMember } from "../service/services";
import FormFieldTextbox from "./form/FormFieldTextbox";
import FormFieldDate from "./form/FormFieldDate";

const FORM_MODE = {
  CREATE: "create",
  UPDATE: "update",
}

const MinutesForm = (props) => {
  const { selectedArticle } = props;
  const { state } = useLocation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: "Default Name",
      image: "Default Image",
      position: "Advisor",
      order: 1,
    }
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [mode, setMode] = useState(FORM_MODE.CREATE);

  const onMinuteSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields to formData
    formData.append("name", data.title);
    formData.append("position", data.position);
    formData.append("order", data.date);

    // Append the selected image to formData
    if (selectedImage) {
      formData.append("image", selectedImage);
    } else {
      formData.append("existing_image", data.image);
    }

    if (mode === FORM_MODE.UPDATE) {
      formData.append("id", state.id);
    }

    try {
      let response;
      if (mode === FORM_MODE.CREATE) {
        response = await axios.post("http://localhost:3001/member", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (mode === FORM_MODE.UPDATE) {
        response = await axios.put(`http://localhost:3001/member/${state.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      reset(response.data); // Clear the form after successful submission
      setSelectedImage(null); // Clear the selected image
    } catch (error) {
      console.error("Error uploading files and text data:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (selectedArticle) {
      reset(selectedArticle);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (state?.id) {
      getMember(state.id).then((data) => {
        reset(data);
        setSelectedImage({
          name: data.image,
          preview: `http://localhost:3000/assets/images/${data.image}`
        })
        setMode(FORM_MODE.UPDATE);
      });
    }
  }, [state]);

  console.log(mode);

  return (
    <form onSubmit={handleSubmit(onMinuteSubmit)}>
      <FormFieldTextbox
        name="Title"
        register={register}
        errors={errors}
        validation={{
          required: "Enter the event title"
        }}
      />
      <FormFieldTextbox
        name="Description"
        register={register}
        errors={errors}
        validation={{}}
      />
      <FormFieldDate
        name="Date"
        register={register}
        errors={errors}
        validation={{
          required: "Enter the event date"
        }}
      />
      <FormFieldTextbox
        name="Location"
        register={register}
        errors={errors}
        validation={{
          required: "enter the event location",
        }}
      />
      <FormFieldTextbox
        name="Contact"
        register={register}
        errors={errors}
        validation={{}}
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default MinutesForm;