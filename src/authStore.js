let user = null;
let token = null;

export const setAuthData = (authUser, authToken) => {
    user = authUser;
    token = authToken;
};

export const getUser = () => user;
export const getToken = () => token;