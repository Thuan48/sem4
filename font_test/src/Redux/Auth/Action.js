import { BASE_API_URL } from "../../config/api"
import { CHANGE_PASSWORD, CONFIRM_EMAIL, FORGOT_PASSWORD, GET_USER_PROFILE, LOGIN, LOGOUT, REGISTER, REQ_USER, RESET_PASSWORD, SEARCH_USER, UPDATE_USER, UPDATE_USER_PROFILE } from "./ActionType";

export const register = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    const resData = await res.json();

    if (!res.ok) {
      throw new Error(resData.message || "Registration failed.");
    }

    if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("register", resData);
    dispatch({ type: REGISTER, payload: resData });
    return { success: true };
  } catch (error) {
    console.log("catch error:", error);
    return { success: false, message: "Email already exists!" };
  }
}

export const login = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    const resData = await res.json();
    if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("login", resData);
    dispatch({ type: LOGIN, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const currenUser = (token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

    })
    const resData = await res.json();
    //console.log("token", resData);
    dispatch({ type: REQ_USER, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const searchUser = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/search?name=${data.keyword}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`
      },

    })
    const resData = await res.json();
    //console.log("search", resData);
    dispatch({ type: SEARCH_USER, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const updateUser = (formData, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });

    const resData = await res.json();
    dispatch({ type: UPDATE_USER, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
};
export const updateProfile = (formData, token) => async (dispatch) => {
  try {
    const data = new FormData();
    data.append('bio', formData.bio);
    data.append('gender', formData.gender);
    data.append('phone', formData.phone);
    data.append('dob', formData.dob);
    data.append('address', formData.address);

    const res = await fetch(`${BASE_API_URL}/api/users/updateProfile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        //"Content-Type": "application/json",
      },
      body: data,
    });

    dispatch({ type: UPDATE_USER_PROFILE, payload: formData });
  } catch (error) {
    console.log("catch error:", error);
  }
};

export const getUserProfile = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/profileUser/${data.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.token}`
      },

    })
    const resData = await res.json();
    dispatch({ type: GET_USER_PROFILE, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const confirmEmail = (email) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/confirm?email=${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Email confirmation failed.");
    }

    const resData = await res.json();
    dispatch({ type: CONFIRM_EMAIL, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email })
    });
    const resData = await res.json();
    dispatch({ type: FORGOT_PASSWORD, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const resetPassword = (email, code, newPassword) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code, newPassword })
    });
    const resData = await res.json();
    dispatch({ type: RESET_PASSWORD, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const changePassword = (token, oldPassword, newPassword) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const resData = await res.json();

    if (!res.ok) {
      return { success: false, message: resData.message || "Failed to change password." };
    }

    dispatch({ type: CHANGE_PASSWORD, payload: resData });
    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    console.log("catch error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export const logout = () => async (dispatch) => {
  localStorage.removeItem("token");
  dispatch({ type: LOGOUT, payload: null });
  dispatch({ type: REQ_USER, payload: null });
};