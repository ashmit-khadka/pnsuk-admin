import React, { useState, useEffect } from "react";
import { getAllArticles, getAllMembers } from "../service/services";
import { useNavigate } from "react-router-dom";

const List = () => {
  const [tableRows, setTableRows] = useState([]);
  const navigate = useNavigate();

  const getTableItems = async () => {
    const rows = [];
    const articleItems = await getAllArticles();
    const memberItems = await getAllMembers();

    articleItems.forEach(article => {
      rows.push({
        id: article.id,
        name: article.title,
        date: article.date,
        action: [],
        type: "Article"
      });
    });

    memberItems.forEach(member => {
      rows.push({
        id: member.id,
        name: member.name,
        date: member.date,
        action: [],
        type: "Member"
      });
    });

    return rows;
  };

  const handleNavigation = (item) => {
    const { id, type } = item;
    return () => {
      if (type === "Article") {
        navigate(`/articles/`, { state: { id } });
      } else if (type === "Member") {
        navigate(`/members/`, { state: { id } }); 
      }
    };
  };


  useEffect(() => {
    const fetchData = async () => {
      const rows = await getTableItems();
      setTableRows(rows);
    };

    fetchData();
  }, []);




  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index} onClick={handleNavigation(row)}>
                <td className="py-2 px-4 border-b border-gray-200">{row.type}</td>
                <td className="py-2 px-4 border-b border-gray-200">{row.name}</td>
                <td className="py-2 px-4 border-b border-gray-200">{row.date}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Edit</button>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;