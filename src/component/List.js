import React, { useState, useEffect } from "react";
import { getAllArticles, getAllMembers, getAllMinutes, getEvents } from "../service/services";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const List = () => {
  const [members, setMembers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [events, setEvents] = useState([]);

  const navigate = useNavigate();


  const getMembers = async () => {
    const members = await getAllMembers();
    const memberObjects = members.map(member => {
      return {
        id: member.id,
        name: member.name,
        image: member.image,
        position: member.position,
        order: member.order,
      };
    });
    setMembers(memberObjects);
  }

  const getArticles = async () => {
    const articles = await getAllArticles();
    const articleObjects = articles.map(article => {
      return {
        id: article.id,
        title: article.title, 
        file: article.title,
        description: article.date,
        image: article.image,
        content: article.content,
        image: article.images[0]?.image || "",
      };
    });
    setArticles(articleObjects);
  }

  const getMinutes = async () => {
    const minutes = await getAllMinutes();
    const minuteObjects = minutes.map(minute => {
      return {
        id: minute.id,
        title: minute.title,
        description: minute.description,
        date: minute.date,
        file: minute.file,
      };
    });
    setMinutes(minuteObjects);
  }

  const getEventsItems = async () => {
    const events = await getEvents();
    setEvents(events);
  }

  const generateMembersTableRows = () => {
    return members.map((member, index) => {
      return (
        <tr key={index}>
          <td>{member.name}</td>
          <td>
            {member.image}
            <img src={`http://localhost:3000/assets/images/${member.image}`} alt={member.name} className="w-10 h-10" />
          </td>
          <td>{member.position}</td>
          <td>{member.order}</td>
          <td>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => navigate(`/member/`, { state: { id: member.id } })}   
            >Edit</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Delete</button>
          </td>
        </tr>
      );
    });
  }

  const generateArticleTableRows = () => {
    return articles.map((article, index) => {
      return (
        <tr key={index}>
          <td>{article.title}</td>
          <td>
            {article.image}
            <img src={`http://localhost:3000/assets/images/${article.image}`} alt={article.title} className="w-10 h-10" />
          </td>
          <td>{article.date}</td>
          <td>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => navigate(`/article/`, { state: { id: article.id } })}   
            >Edit</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Delete</button>
          </td>
        </tr>
      );
    });
  }

  const generateMinutesTableRows = () => {
    return minutes.map((minute, index) => {
      return (
        <tr key={index}>
          <td>{minute.title}</td>
          <td>{minute.description}</td>
          <td>{minute.date}</td>
          <td>{minute.file}</td>
          <td>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => navigate(`/minute/`, { state: { id: minute.id } })}   
            >Edit</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Delete</button>
          </td>
        </tr>
      );
    });
  }

  const onDeleteEvent = async (event) => 
  {

    try{
      await axios.delete(`http://localhost:3001/events/${event.id}`);
    } catch (error){
      console.error("Error deleting event data:", error);
    }
  }

  const generateEventsTableRows = () => {
    return events.map((event, index) => {
      return (
        <tr key={index}>
          <td>{event.title}</td>
          <td>{event.description}</td>
          <td>{event.date}</td>
          <td>{event.location}</td>
          <td>{event.contact}</td>
          <td>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => navigate(`/event/`, { state: { id: event.id } })}   
            >Edit</button>
            <button onClick={() => onDeleteEvent(event)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Delete</button>
          </td>
        </tr>
      );
    });
  }

  useEffect(() => {
    getEventsItems();
  }, [events]);


  useEffect(() => {
    getMembers();
    getArticles();
    getMinutes();
    getEventsItems();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-semibold mt-4">Articles</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
            onClick={() => navigate(`/article/`)}
          >Add Article</button>
        </div>
        <table className="min-w-full bg-white border border-gray-200 mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Image</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {generateArticleTableRows()}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-semibold mt-4">Members</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
            onClick={() => navigate(`/member/`)}
          >Add Member</button>
        </div>
        <table className="min-w-full bg-white border border-gray-200 mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Image</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Position</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Order</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {generateMembersTableRows()}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-semibold mt-4">Minutes</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
            onClick={() => navigate(`/minute/`)}
          >Add Minute</button>
          </div>

        <table className="min-w-full bg-white border border-gray-200 mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Date</th>

              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">File</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {generateMinutesTableRows()}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-semibold mt-4">Events</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
            onClick={() => navigate(`/event/`)}
          >Add Event</button>
          </div>


        <table className="min-w-full bg-white border border-gray-200 mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {generateEventsTableRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;