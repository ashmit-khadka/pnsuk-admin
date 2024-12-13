import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import { getMember } from "../service/services";
import FormFieldTextbox from "./form/FormFieldTextbox";
import FormFieldDate from "./form/FormFieldDate";
import FormFieldFile from "./form/FormFieldFile";

const FORM_MODE = {
  CREATE: "create",
  UPDATE: "update",
}

const MinutesForm = (props) => {
  const { selectedMinute } = props;
  const { state } = useLocation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: "Exmple title",
      description: "Example description",
      date:  new Date().toISOString().split('T')[0],
      order: 1,
    }
  });

  const [selectedDocument, setSelectedDocument ] = useState(null);
  const [mode, setMode] = useState(FORM_MODE.CREATE);

  const onMinuteSubmit = async (data) => {
    const formData = new FormData();


    // Append text fields to formData
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("date", data.date);

    // Append the selected image to formData
    if (selectedDocument) {
      formData.append("document", selectedDocument);
    } else {
      formData.append("existing_document", data.document);
    }

    if (mode === FORM_MODE.UPDATE) {
      formData.append("id", state.id);
    }

    try {
      let response;
      if (mode === FORM_MODE.CREATE) {
        response = await axios.post("http://localhost:3001/minutes", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (mode === FORM_MODE.UPDATE) {
        response = await axios.put(`http://localhost:3001/minutes/${state.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      reset(response.data); // Clear the form after successful submission
      setSelectedDocument(null); // Clear the selected image
    } catch (error) {
      console.error("Error uploading files and text data:", error);
    }
  };

  useEffect(() => {
    if (selectedMinute) {
      reset(selectedMinute);
    }
  }, [selectedMinute]);

  useEffect(() => {
    if (state?.id) {
      getMember(state.id).then((data) => {
        reset(data);
        setSelectedDocument({
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
        id="title"
        label="Title"
        register={register}
        errors={errors}
        validation={{
          required: "Enter the minute title"
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
          required: "Enter the minute date"
        }}
      />
      <FormFieldFile
        id="document"
        label="Document"
        register={register}
        errors={errors}
        validation={{
          required: "Upload the minute document"
        }}
        setSelectedFile={setSelectedDocument}
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default MinutesForm;