import React, { useEffect, useState } from "react";
import axios from "axios";
import { get, set, useForm } from "react-hook-form";
import MemberForm from "./MembersForm";

const ArticleForm = (props) => {
  const { selectedArticle } = props;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: "Default Title",
      text: "Default Text",
      date: "",
      is_event: false,
      is_aid: false,
      is_guest: false,
      is_project: false,
      is_home: true,
      is_sport: false,
      images: []
    }
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields to formData
    if (data.id) {
      formData.append("id", data.id);
    }
    formData.append("title", data.title);
    formData.append("text", data.text);
    formData.append("date", data.date);
    formData.append("is_event", data.is_event);
    formData.append("is_aid", data.is_aid);
    formData.append("is_guest", data.is_guest);
    formData.append("is_project", data.is_project);
    formData.append("is_home", data.is_home);
    formData.append("is_sport", data.is_sport);


    // Append the selected images to formData
  selectedImages.forEach((image) => {
    if (image instanceof File) {
      formData.append("images", image);
    }
    else {
      formData.append("existing_images[]", image.image);
    }
  });
    try {
      const response = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log(response.data);
      reset(); // Clear the form after successful submission
      setSelectedImages([]); // Clear the selected images
    } catch (error) {
      console.error("Error uploading files and text data:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImages([...selectedImages, file]);
    }
  };


  const handleDeleteImage = async (index) => {
    const image = selectedImages[index];
    if (image.id) {
      try {
        const response = await axios.delete(`http://localhost:3001/article/image/${image.id}`);
        console.log(response.data);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const newImages = selectedImages.filter((image, i) => i !== index);
    setSelectedImages(newImages);

  };
  
  useEffect(() => {
    if (selectedArticle) {
      reset({
        id: selectedArticle.id,
        title: selectedArticle.title,
        text: selectedArticle.text,
        date: selectedArticle.date,
        is_event: selectedArticle.is_event,
        is_aid: selectedArticle.is_aid,
        is_guest: selectedArticle.is_guest,
        is_project: selectedArticle.is_project,
        is_home: selectedArticle.is_home,
        is_sport: selectedArticle.is_sport,
      });
      setSelectedImages(selectedArticle.images);
    }
  }, [selectedArticle]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter title"
            {...register("title", { required: true })}
          />
          {errors.title && <span>Title is required</span>}
        </div>
        <div>
          <label>Text</label>
          <textarea
            placeholder="Enter text"
            {...register("text", { required: true })}
          />
          {errors.text && <span>Text is required</span>}
        </div>
        <div>
          <label>Date</label>
          <input
            type="date"
            {...register("date", { required: true })}
          />
          {errors.date && <span>Date is required</span>}
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_event")}
          />
          <label>Is Event</label>
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_aid")}
          />
          <label>Is Aid</label>
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_guest")}
          />
          <label>Is Guest</label>
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_project")}
          />
          <label>Is Project</label>
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_home")}
          />
          <label>Is Home</label>
        </div>
        <div>
          <input
            type="checkbox"
            {...register("is_sport")}
          />
          <label>Is Sport</label>
        </div>
        <div>
          <label>Images</label>
          <input
            type="file"
            onChange={handleImageChange}
          />
          {selectedImages.map((image, index) => (
            <div key={index}>
              <span>{image.name || image.image}</span>
              <button type="button" onClick={() => handleDeleteImage(index)}>Delete</button>
            </div>
          ))}
        </div>
        <button type="submit">Upload</button>
      </form>
      <button onClick={() => {}}>Delete</button>
      <button onClick={() => {}}>Update</button>

    </>
  );
};

//export default ImageUpload;

const getAllArticles = async () => {
  const response = await axios.get("http://localhost:3001/articles");
  return response.data;
}

const getAllArticleSelectionItems = async () => {
  const response = await getAllArticles();
  const seletionItems = response.data.map((item) => ({
    id: item.id,
    text: item.title
  }));
  return seletionItems;
}

const getArticle = async (id) => {
  const response = await axios.get(`http://localhost:3001/article/${id}`);
  return response.data;
}

const getAllMembers = async () => {
  const response = await axios.get("http://localhost:3001/members");
  return response.data;
}


const getAllMemberSelectionItems = async () => {
  const response = await getAllMembers();
  const seletionItems = response.data.map((item) => ({
    id: item.id,
    text: item.name
  }));
  return seletionItems;
}

const getMember = async (id) => {
  const response = await axios.get(`http://localhost:3001/member/${id}`);
  return response.data;
}


const FormWrapper = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const getAllItems = getAllMemberSelectionItems;
  const getItem = getMember;


  const handleSelectItem = (e) => {
    const id = e.target.value;
    getItem(id).then((item) => {
      console.log(id, item);
      setSelectedItem(item);
    });
  };

  useEffect(() => {
    getAllItems().then((items) => {
      setItems(items);
    });
  }, []);

  return (
    <div>
      <select
        onChange={(e) => handleSelectItem(e)}
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.text}</option>
        ))}
      </select>

      {/* <ArticleForm selectedArticle={selectedItem} /> */}
      <MemberForm selectedArticle={selectedItem} />
    </div>
  );
}

export default FormWrapper;
