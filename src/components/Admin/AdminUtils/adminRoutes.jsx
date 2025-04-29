import React from 'react';
import { Route } from 'react-router-dom';
import UserDetail from '../UserDetail';

// Add route for single user details
<Route path="/users/:userId" element={<UserDetail />} /> 