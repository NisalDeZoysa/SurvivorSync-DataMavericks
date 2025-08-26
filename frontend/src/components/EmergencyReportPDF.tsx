import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';


const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: '1 solid #333', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  section: { marginBottom: 15 },
  heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#2c5282' },
  subheading: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, color: '#4a5568' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' },
  agentSection: { marginBottom: 12, border: '1 solid #e2e8f0', padding: 10, borderRadius: 4 },
  agentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  agentName: { fontWeight: 'bold', color: '#2b6cb0' },
  agentStatus: { color: '#38a169', fontWeight: 'bold' },
  responseContainer: { backgroundColor: '#f7fafc', padding: 8, borderRadius: 4, marginTop: 4 },
  statusError: { color: '#e53e3e' },
  statusSuccess: { color: '#38a169' },
  timestamp: { fontSize: 10, color: '#718096', marginTop: 4 }
});


const DisasterRequestReportPDF =  ({ request, gatewayResponse,resourceCenterDetails }) => {

  if (!request || !gatewayResponse) {
      return (
        <Document>
          <Page style={styles.page}>
            <Text>Loading resource details...</Text>
          </Page>
        </Document>
      );
    }


  console.log("Gateway Response:", gatewayResponse);
  console.log("Resource Center Details:", resourceCenterDetails);

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Disaster Request Report</Text>
          <Text style={styles.subheading}>Request ID: {request?.id ?? 'N/A'}</Text>
          <Text style={styles.subheading}>Generated: {new Date().toLocaleString()}</Text>
        </View>

        {/* Request Details Section */}
        <View style={styles.section}>
          <Text style={styles.heading}>Request Details</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{request?.name ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{request?.status ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Disaster ID:</Text>
            <Text style={styles.value}>{request?.disasterId ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Severity:</Text>
            <Text style={styles.value}>{request?.severity ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Details:</Text>
            <Text style={styles.value}>{request?.details ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Affected Count:</Text>
            <Text style={styles.value}>{request?.affectedCount ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{request?.contactNo ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {(request?.latitude ?? 'N/A')}, {(request?.longitude ?? 'N/A')}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>District:</Text>
            <Text style={styles.value}>{request?.district ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Province:</Text>
            <Text style={styles.value}>{request?.province ?? 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Created At:</Text>
            <Text style={styles.value}>
              {request?.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Agent Responses Section */}
        {/* <View style={styles.section}>
          <Text style={styles.heading}>Agent Processing Results</Text>
          
          {Array.isArray(agentResponses) && agentResponses.length > 0 ? agentResponses.map((agent, index) => (
            <View key={index} style={styles.agentSection} wrap={false}>
              <View style={styles.agentHeader}>
                <Text style={styles.agentName}>
                  {(agent?.agent ?? 'N/A').replace(/-/g, ' ').toUpperCase()}
                </Text>
                <Text style={agent?.status === 'success' ? styles.statusSuccess : styles.statusError}>
                  {(agent?.status ?? 'N/A').toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.subheading}>Response:</Text>
              <View style={styles.responseContainer}>
                {agent?.response?.response
                  ? Object.entries(agent.response.response).map(([key, value]) => (
                      <View key={key} style={{ marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold' }}>
                          {key.replace(/_/g, ' ').toUpperCase()}:
                        </Text>
                        <Text>
                          {value === null || value === undefined
                            ? 'N/A'
                            : typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : value.toString()}
                        </Text>
                      </View>
                    ))
                  : <Text>N/A</Text>
                }
              </View>
              
              <Text style={styles.timestamp}>
                Processed: {agent?.timestamp ? new Date(agent.timestamp).toLocaleString() : 'N/A'}
              </Text>
            </View>
          )) : <Text>No agent responses available.</Text>}
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subheading}>Overall Status:</Text>
            <Text style={gatewayData?.overall_status === 'completed' 
                  ? styles.statusSuccess 
                  : styles.statusError}>
              {(gatewayData?.overall_status ?? 'N/A').toUpperCase()}
            </Text>
          </View>
        </View> */}
        {/* Agent Responses Section */}
        <View style={styles.section}>
          <Text style={styles.heading}>Agent Processing Results</Text>

          {/* User-friendly status and message */}
          <View style={styles.agentSection}>
            <View style={styles.agentHeader}>
              <Text style={styles.agentName}>REQUEST STATUS</Text>
              <Text
                style={
                  gatewayResponse?.status === "verified"
                    ? styles.statusSuccess
                    : styles.statusError
                }
              >
                {(gatewayResponse?.status ?? "N/A").toUpperCase()}
              </Text>
            </View>

            <Text style={styles.subheading}>Message to You:</Text>
            <View style={styles.responseContainer}>
              <Text>
                {gatewayResponse?.user_msg ??
                  "We are processing your request and will update you soon."}
              </Text>
            </View>

            <Text style={styles.subheading}>Current Disaster Status:</Text>
            <Text>{gatewayResponse?.disaster_status ?? "N/A"}</Text>
          </View>

          {/* Allocated Resource Centers */}
          {resourceCenterDetails.length > 0 && (
            <View style={[styles.agentSection, { marginTop: 12 }]}>
              <Text style={styles.subheading}>
                Resources Allocated for You
              </Text>
              <Text style={{ marginBottom: 6 }}>
                These are the resource centers assigned to help. If the
                situation is urgent, you may directly contact them:
              </Text>
              {resourceCenterDetails.map((rc) => (
                <View key={rc.resourceId} style={styles.responseContainer}>
                  <Text style={{ fontWeight: "bold" }}>{rc.name}</Text>
                  <Text>Contact: {rc.contactNumber}</Text>
                  <Text>ID: {rc.resourceId}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default DisasterRequestReportPDF;
