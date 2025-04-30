import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { checkBannedStatus } from "../utils/authUtils";

const ProtectedRoute = ({ children, requiredRole, restrictedRoles = [] }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/login");

  useEffect(() => {
    let banStatusUnsubscribe = null;
    
    const checkAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Set up banned status listener for this user
          banStatusUnsubscribe = checkBannedStatus(user.uid);
          
          // Get user data
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role || "user";
            
            // Check if user is banned
            if (userData.banned) {
              setIsAuthorized(false);
              setRedirectPath("/login");
              setIsLoading(false);
              return;
            }
            
            // Check restricted roles - redirects admin to admin dashboard
            if (restrictedRoles.includes(userRole)) {
              setIsAuthorized(false);
              setRedirectPath(userRole === "admin" ? "/admin" : "/login");
              setIsLoading(false);
              return;
            }
            
            // Check required role
            if (requiredRole && userRole !== requiredRole) {
              setIsAuthorized(false);
              setRedirectPath(userRole === "admin" ? "/admin" : "/home");
            } else {
              setIsAuthorized(true);
            }
          } else {
            setIsAuthorized(false);
            setRedirectPath("/login");
          }
        } else {
          setIsAuthorized(false);
          setRedirectPath("/login");
        }
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
        if (banStatusUnsubscribe) banStatusUnsubscribe();
      };
    };

    checkAuth();
    
    return () => {
      if (banStatusUnsubscribe) banStatusUnsubscribe();
    };
  }, [requiredRole, restrictedRoles]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to={redirectPath} />;
};

export default ProtectedRoute;