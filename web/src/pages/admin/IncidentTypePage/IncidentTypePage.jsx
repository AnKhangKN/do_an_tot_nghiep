import React, { useEffect } from 'react'
import * as IncidentTypesApi from "@/api/admin/IncidentTypeApi";

const IncidentTypePage = () => {
  const [incidentTypes, setIncidentTypes] = React.useState([]);

  useEffect(() => {
    const fetchIncidentTypes = async () => {
      try {
        const response = await IncidentTypesApi.getIncidentTypes();
        const data = response?.data || [];
        console.log(response?.data);
        setIncidentTypes(data);
      } catch (error) {
        console.error("Error fetching incident types:", error);
      }
    };

    fetchIncidentTypes();
  }, []);

  

  return (
    <div>IncidentTypePage</div>
  )
}

export default IncidentTypePage