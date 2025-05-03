export const processResponse = (response: any) => {
  if (
    response &&
    (response.status === 200 ||
      response.status === 201 ||
      response.status === 202 ||
      response.statusText)
  ) {
    console.log("response success -> ", response.status, response.statusText);
    return Array.isArray(response) ? response : response.data;
  }
  return response;
};
