import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";

const ProtectedRpoute=({children}:{children:JSX.Element})=>{
 const token=localStorage.getItem("token");
 if(!token){
    return <Navigate to="/"/>
 }    
 return children
}

export default ProtectedRpoute