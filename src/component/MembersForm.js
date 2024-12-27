import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import { getMember } from "../service/services";

const FORM_MODE = {
  CREATE: "create",
  UPDATE: "update",
}

const MemberForm = (props) => {
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

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields to formData
    formData.append("name", data.name);
    formData.append("position", data.position);
    formData.append("order", data.order);

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter name"
          {...register("name", { required: true })}
        />
        {errors.name && <span>Name is required</span>}
      </div>
      <div>
        <label>Position</label>
        <input
          type="text"
          placeholder="Enter position"
          {...register("position", { required: true })}
        />
        {errors.position && <span>Position is required</span>}
      </div>
      <div>
        <label>Order</label>
        <input
          type="number"
          placeholder="Enter order"
          {...register("order", { required: true })}
        />
        {errors.order && <span>Order is required</span>}
      </div>
      <div>
        <label>Image</label>
        <input
          type="file"
          onChange={handleImageChange}
        />
        {selectedImage && (
          <div>
            <span>{selectedImage.name}</span>
            <img src={selectedImage.preview || URL.createObjectURL(selectedImage)} alt="Selected" className="w-32 h-32 object-cover" />
            <button type="button" onClick={handleDeleteImage}>Delete</button>
          </div>
        )}
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default MemberForm;