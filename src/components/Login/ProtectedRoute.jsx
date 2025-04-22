import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { checkBannedStatus } from "../utils/authUtils";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let banStatusUnsubscribe = null;
    
    const checkAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Set up banned status listener for this user
          banStatusUnsubscribe = checkBannedStatus(user.uid);
          
          // Check if the user meets authorization requirements
          if (requiredRole) {
            // If a specific role is required, check it
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Check both role and banned status
              if (userData.role === requiredRole && !userData.banned) {
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
              }
            } else {
              setIsAuthorized(false);
            }
          } else {
            // If no specific role required, just being logged in and not banned is enough
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && !userDoc.data().banned) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          }
        } else {
          setIsAuthorized(false);
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
  }, [requiredRole]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;