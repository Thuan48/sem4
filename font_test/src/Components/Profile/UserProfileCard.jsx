import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currenUser, updateProfile } from "../../Redux/Auth/Action";
import { ArrowLeft } from 'lucide-react';
import provinces from './Data/vnProvinces.json';
import districts from './Data/vnDistricts.json';
import wards from './Data/vnWards.json';

const UserProfileCard = ({ handleNavigate }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.reqUser);
  const token = localStorage.getItem('token');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    gender: '',
    phone: '',
    dob: '',
    address: ''
  });

  useEffect(() => {
    if (token) {
      dispatch(currenUser(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (user) {
      const addressParts = user.address ? user.address.split(', ') : ['', '', ''];
      setSelectedProvince(addressParts[0] || '');
      setSelectedDistrict(addressParts[1] || '');
      setSelectedWard(addressParts[2] || '');
      setFormData({
        bio: user.bio || '',
        gender: user.gender || '',
        phone: user.phone || '',
        dob: user.dob || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict('');
    setSelectedWard('');
    setFormData((prevData) => ({
      ...prevData,
      address: `${province}, ,`
    }));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSelectedWard('');
    setFormData((prevData) => ({
      ...prevData,
      address: `${selectedProvince}, ${district},`
    }));
  };

  const handleWardChange = (e) => {
    const ward = e.target.value;
    setSelectedWard(ward);
    setFormData((prevData) => ({
      ...prevData,
      address: `${selectedProvince}, ${selectedDistrict}, ${ward}`
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData, token));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        gender: user.gender || '',
        phone: user.phone || '',
        dob: user.dob || '',
        address: user.address || ''
      });
      const addressParts = user.address ? user.address.split(', ') : ['', '', ''];
      setSelectedProvince(addressParts[0] || '');
      setSelectedDistrict(addressParts[1] || '');
      setSelectedWard(addressParts[2] || '');
    }
    setIsEditing(false);
  };

  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}*@${domain}`;
    }
    const maskedLocal = localPart.slice(0, -2) + '**';
    return `${maskedLocal}@${domain}`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const today = new Date();
  const minDate = new Date(today.getFullYear() - 50, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const imageUrl = user.profile_picture
    ? `http://localhost:8080/uploads/profile/${user.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center space-x-4 bg-teal-500 text-white px-6 py-4 rounded-t-lg">
          <button
            onClick={handleNavigate}
            className="p-2 hover:bg-teal-600 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg"
                src={imageUrl}
                alt="Profile"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{user.full_name}</p>
            {isEditing ? (
              <>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <label htmlFor="bio" className="w-1/5 text-sm font-medium text-gray-700 dark:text-gray-300">Bio:</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="gender" className="w-1/5 text-sm font-medium text-gray-700 dark:text-gray-300">Gender:</label>
                    <input
                      type="text"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="phone" className="w-1/5 text-sm font-medium text-gray-700 dark:text-gray-300">Phone:</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="dob" className="w-1/5 text-sm font-medium text-gray-700 dark:text-gray-300">DOB:</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                      min={minDate}
                      max={maxDate}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-1/5 text-sm font-medium text-gray-700 dark:text-gray-300">Address:</label>
                    <div className="flex space-x-2 w-4/5">
                      <select
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-24 p-1 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">City</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>

                      {selectedProvince && (
                        <select
                          value={selectedDistrict}
                          onChange={handleDistrictChange}
                          className="w-24 p-1 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">District</option>
                          {districts
                            .filter((d) => d.province === selectedProvince)
                            .map((district) => (
                              <option key={district.code} value={district.name}>
                                {district.name}
                              </option>
                            ))}
                        </select>
                      )}

                      {selectedDistrict && (
                        <select
                          value={selectedWard}
                          onChange={handleWardChange}
                          className="w-24 p-1 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">Ward</option>
                          {wards
                            .filter((w) => w.district === selectedDistrict)
                            .map((ward) => (
                              <option key={ward.code} value={ward.name}>
                                {ward.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="hidden"
                  name="address"
                  value={`${selectedProvince}, ${selectedDistrict}, ${selectedWard}`}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300">{user.bio}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-800 dark:text-gray-200">{maskEmail(user.email)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Address:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.address}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleNavigate}
              className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;