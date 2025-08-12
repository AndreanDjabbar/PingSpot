const getAuthToken = () => {
    const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
    if (!token) {
        return null;
    }
    return token;
}

export default getAuthToken;