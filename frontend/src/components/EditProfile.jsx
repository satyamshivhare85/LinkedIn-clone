import React, { useContext, useState, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import { FaCamera, FaPlusCircle } from "react-icons/fa";
import { UserDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import dp from "../assets/User.webp";

/* ================= Reusable ArrayInput ================= */
function ArrayInput({ items, setItems, newItem, setNewItem, fields, placeholder, displayItem }) {
  const addItem = (e) => {
    e.preventDefault();

    if (Array.isArray(fields)) {
      const valid = fields.every((f) => newItem[f].trim() !== "");
      if (!valid) return;

      setItems([...items, newItem]);
      setNewItem(fields.reduce((acc, f) => ({ ...acc, [f]: "" }), {}));
    } else {
      if (newItem.trim() && !items.includes(newItem)) {
        setItems([...items, newItem]);
      }
      setNewItem("");
    }
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="border-2 rounded p-3 flex flex-col gap-3 mt-4">
      <h2 className="text-lg font-semibold">{placeholder}</h2>

      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
          >
            {displayItem(item)}
            <RxCross1 className="cursor-pointer" onClick={() => removeItem(idx)} />
          </div>
        ))}
      </div>

      <form onSubmit={addItem} className="flex flex-col gap-2">
        {Array.isArray(fields)
          ? fields.map((f) => (
              <input
                key={f}
                type="text"
                placeholder={f}
                value={newItem[f]}
                onChange={(e) => setNewItem({ ...newItem, [f]: e.target.value })}
                className="border px-2 py-1 rounded"
              />
            ))
          : (
            <input
              type="text"
              placeholder={`Add new ${placeholder}`}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          )}

        <button
          type="submit"
          className="h-[35px] px-3 rounded-full border-2 border-blue-400 text-blue-600 cursor-pointer"
        >
          Add
        </button>
      </form>
    </div>
  );
}

/* ================= EditProfile ================= */
/* ================= EditProfile ================= */
function EditProfile() {
  const { edit, setEdit, userData } = useContext(UserDataContext);
  const { serverUrl } = useContext(authDataContext);

  const profilePicRef = useRef(null);
  const coverImageRef = useRef(null);

  const [frontendProfilePic, setFrontendProfilePic] = useState(userData.profileImage || dp);
  const [backendProfilePic, setBackendProfilePic] = useState(null);

  const [frontendCoverPic, setFrontendCoverPic] = useState(userData.coverImage || dp); // cover always visible
  const [backendCoverPic, setBackendCoverPic] = useState(null);

  const [firstname, setFirstname] = useState(userData.firstname || "");
  const [lastname, setLastname] = useState(userData.lastname || "");
  const [username, setUsername] = useState(userData.username || "");
  const [headline, setHeadline] = useState(userData.headline || "");
  const [location, setLocation] = useState(userData.location || "");
  const [gender, setGender] = useState(userData.gender || "");

  const [skills, setSkills] = useState(userData.skills || []); // keep existing skills
  const [newSkill, setNewSkill] = useState("");

  const [education, setEducation] = useState(userData.education || []); // keep existing education
  const [newEducation, setNewEducation] = useState({ college: "", degree: "", fieldofStudy: "" });

  const [experience, setExperience] = useState(userData.experience || []);
  const [newExperience, setNewExperience] = useState({ title: "", company: "", description: "" });

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendProfilePic(file);
    setFrontendProfilePic(URL.createObjectURL(file));
  };

  const handleCoverPicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendCoverPic(file);
    setFrontendCoverPic(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    try {
      const formdata = new FormData();
      formdata.append("firstname", firstname);
      formdata.append("lastname", lastname);
      formdata.append("username", username);
      formdata.append("headline", headline);
      formdata.append("location", location);
      formdata.append("gender", gender);

      formdata.append("skills", JSON.stringify(skills));
      formdata.append("education", JSON.stringify(education));
      formdata.append("experience", JSON.stringify(experience));

      if (backendProfilePic) formdata.append("profileImage", backendProfilePic);
      if (backendCoverPic) formdata.append("coverImage", backendCoverPic);

      const result = await axios.put(`${serverUrl}/api/user/updateprofile`, formdata, { withCredentials: true });
      console.log("Profile Updated:", result.data);
      setEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error.response ? error.response.data : error);
      alert("Profile update failed. Check console for details.");
    }
  };

  if (!edit) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center">
      <input type="file" accept="image/*" hidden ref={profilePicRef} onChange={handleProfilePicChange} />
      <input type="file" accept="image/*" hidden ref={coverImageRef} onChange={handleCoverPicChange} />

      <div className="absolute inset-0 bg-black opacity-50" onClick={() => setEdit(false)} />

      <div className="relative z-[200] bg-white w-[90%] max-w-[600px] h-[90%] rounded-lg shadow-lg overflow-auto p-4">
        <button onClick={() => setEdit(false)} className="absolute top-2 right-2 z-50 cursor-pointer ">
          <RxCross1 className="w-6 h-6 text-gray-700" />
        </button>

        {/* Cover */}
        <div
          className="relative w-full h-[160px] mt-6 bg-gray-300 bg-cover bg-center"
          style={{ backgroundImage: `url(${frontendCoverPic})` }}
        >
          <button onClick={() => coverImageRef.current.click()} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow cursor-pointer">
            <FaCamera />
          </button>
        </div>

        {/* Profile pic */}
        <div className="relative px-6">
          <div className="relative w-[90px] h-[90px] -mt-[45px] rounded-full border-4 border-white overflow-hidden">
            <img src={frontendProfilePic} alt="profile" className="w-full h-full object-cover" />
            <span onClick={() => profilePicRef.current.click()} className="absolute bottom-1 right-1 bg-white rounded-full p-[3px] shadow cursor-pointer">
              <FaPlusCircle className="text-blue-600 text-[18px]" />
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex flex-col gap-4 mt-4">
          {[{ label: "First name", value: firstname, set: setFirstname },
            { label: "Last name", value: lastname, set: setLastname },
            { label: "Username", value: username, set: setUsername },
            { label: "Headline", value: headline, set: setHeadline },
            { label: "Location", value: location, set: setLocation },
            { label: "Gender", value: gender, set: setGender }].map((f, i) => (
            <input key={i} type="text" placeholder={f.label} value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          ))}
        </div>

        {/* Skills */}
        <ArrayInput
          items={skills}
          setItems={setSkills}
          newItem={newSkill}
          setNewItem={setNewSkill}
          fields={null}
          placeholder="Skills"
          displayItem={(s) => s}
        />

        {/* Education */}
        <ArrayInput
          items={education}
          setItems={setEducation}
          newItem={newEducation}
          setNewItem={setNewEducation}
          fields={["college", "degree", "fieldofStudy"]}
          placeholder="Education"
          displayItem={(e) => `${e.college} | ${e.degree} | ${e.fieldofStudy}`}
        />

        {/* Experience */}
        <ArrayInput
          items={experience}
          setItems={setExperience}
          newItem={newExperience}
          setNewItem={setNewExperience}
          fields={["title", "company", "description"]}
          placeholder="Experience"
          displayItem={(e) => `${e.title} | ${e.company} | ${e.description}`}
        />

        {/* Save Button */}
        <div className="w-full flex justify-end mt-6">
          <button onClick={handleSaveProfile} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
