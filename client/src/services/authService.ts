import { IRegisterFormType } from "@/app/auth/types";
import axios from "axios";

const AUTH_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export const registerService = async (payload: IRegisterFormType) => axios.post(`${AUTH_API_URL}/register`, payload)