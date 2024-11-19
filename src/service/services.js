
import axios from "axios";

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

export {
  getAllArticleSelectionItems,
  getAllMemberSelectionItems,
  getAllArticles,
  getAllMembers,
  getArticle,
  getMember,
}