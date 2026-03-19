import axios from "axios"


const api= axios.create({
    baseURL:"http://localhost:3000",
    withCredentials: true // Required to send cookies (auth/session tokens); axios doesn't include them by default
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data
    } catch (err) {
        console.log(err)
    }

}


export async function login({email, password}) {
    try {
        const response= await api.post("/auth/api/login",{
            email , password
        })

        return response.data
    } catch (err) {
        console.log(err);
    }
}


export async function logout() {
    try {
     const response = await api.get("/api/auth/logout")   
     return response.data
    } catch (error) {
        console.log(error);
    }
}

export async function getMe() {
    try{
    const response = await api.get("/api/auth/get-me"
    )

    return response.data
    }
    catch(err){
        console.log(err)
    }
}