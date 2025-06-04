// EmergencyReportPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24 },
  section: { marginBottom: 12, padding: 12, borderBottom: '1 solid #eee' },
  heading: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  label: { fontWeight: 'bold' },
  text: { marginBottom: 4 }
});

const EmergencyReportPDF = ({ disasters }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Emergency Reports</Text>
      {disasters.map((disaster, idx) => (
        <View key={disaster.id || idx} style={styles.section}>
          <Text style={styles.label}>Type: <Text style={styles.text}>{disaster.type}</Text></Text>
          <Text style={styles.label}>Location: <Text style={styles.text}>{disaster.location.address}</Text></Text>
          <Text style={styles.label}>Reported: <Text style={styles.text}>{new Date(disaster.timestamp).toLocaleString()}</Text></Text>
          <Text style={styles.label}>Severity: <Text style={styles.text}>{disaster.severity}</Text></Text>
          <Text style={styles.label}>Affected: <Text style={styles.text}>{disaster.affectedCount} people</Text></Text>
          <Text style={styles.label}>Contact: <Text style={styles.text}>{disaster.contactNo || 'N/A'}</Text></Text>
          <Text style={styles.label}>Status: <Text style={styles.text}>{disaster.status}</Text></Text>
          <Text style={styles.label}>Details: <Text style={styles.text}>{disaster.details}</Text></Text>
        </View>
      ))}
    </Page>
  </Document>
);

export default EmergencyReportPDF;
