import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import { getMember } from "../service/services";
import { useNavigate } from "react-router-dom";
import FormFieldTextbox from "./form/FormFieldTextbox";
import FormFieldDate from "./form/FormFieldDate";

const FORM_MODE = {
  CREATE: "create",
  UPDATE: "update",
}

const EventForm = (props) => {
  const { selectedArticle } = props;
  const { state } = useLocation();

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: " Default Title",
      description: " Default Description",
      date: " 10/10/2000",
      location: " 1",
      contact: " Contact",
    }
  });

  const [mode, setMode] = useState(FORM_MODE.CREATE);

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields to formData
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("date", data.date);
    formData.append("location", data.location);
    formData.append("contact", data.contact);

    // Append the selected image to formData
    // if (selectedImage) {
    //   formData.append("image", selectedImage);
    // } else {
    //   formData.append("existing_image", data.image);
    // }

    if (mode === FORM_MODE.UPDATE) {
      formData.append("id", state.id);
    }

    try {
      let response;
      if (mode === FORM_MODE.CREATE) {
        response = await axios.post("http://localhost:3001/events", formData, {
          headers: { "Content-Type": "application/json" }
        });
      } else if (mode === FORM_MODE.UPDATE) {
        response = await axios.put(`http://localhost:3001/event/${state.id}`, formData, {
          headers: { "Content-Type": "application/json" }
        });

     }

      //reset(response.data); // Clear the form after successful submission
      //setSelectedImage(null); // Clear the selected image
      navigate(`/list/`);
    } catch (error) {
      console.error("Error uploading files and text data:", error);
    }
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedImage(file);
  //   }
  // };



  useEffect(() => {
    if (state?.id) {
      getMember(state.id).then((data) => {
        reset(data);
        setMode(FORM_MODE.UPDATE);
      });
    }
  }, [state]);

  console.log(mode);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter Title"
          {...register("title", { required: true })}
        />
        {errors.title && <span>Title is required</span>}
      </div>
      <div>
        <label>Description</label>
        <input
          type="text"
          placeholder="Enter Description"
          {...register("description", { required: true })}
        />
        {errors.description && <span>Description is required</span>}
      </div>
      <div>
        <label>Date</label>
        <input
          type="text"
          placeholder="Enter Date"
          {...register("date", { required: true })}
        />
        {errors.date && <span>Date is required</span>}
      </div>
      <div>
        <label>Location</label>
        <input
          type="text"
          placeholder="Enter Location"
          {...register("location", { required: true })}
        />
        {errors.location && <span>Location is required</span>}
      </div>
      <div>
        <label>Contact</label>
        <input
          type="text"
          placeholder="Enter Contact"
          {...register("contact", { required: true })}
        />
        {errors.contact && <span>Contact is required</span>}
      </div>
      {/* <FormFieldTextbox
        id="title"
        label="Title"
        register={register}
        errors={errors}
        validation={{
          required: "Enter the Title"
        }}
      />
      <FormFieldTextbox
        id="description"
        label="Description"
        register={register}
        errors={errors}
        validation={{}}
      />
      <FormFieldDate
        id="date"
        label="Date"
        register={register}
        errors={errors}
        validation={{
          required: "Enter the date"
        }}
      />
      <FormFieldTextbox
        id="location"
        label="location"
        register={register}
        errors={errors}
        validation={{}}
      />
      <FormFieldTextbox
        id="contact"
        label="contact"
        register={register}
        errors={errors}
        validation={{}}
      /> */}
      <button type="submit">Save</button>
    </form>
  );
};

export default EventForm;