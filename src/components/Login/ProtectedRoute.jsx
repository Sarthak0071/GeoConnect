import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          if (requiredRole) {
            // If a specific role is required, check it
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === requiredRole) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          } else {
            // If no specific role required, just being logged in is enough
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;