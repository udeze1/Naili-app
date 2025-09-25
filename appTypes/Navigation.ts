export type RootStackParamList = {
  Landing: undefined;
  Register: undefined;
  OTP?: { email?:string,  phoneNumber?: string };
  Login: undefined;
MainTabs:  { isGuest: boolean } | undefined;

  

  // Screens used inside MainTabs
  Search: undefined;
  Support: undefined;
  Orders: undefined; 
};


