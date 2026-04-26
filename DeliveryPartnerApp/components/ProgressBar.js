import React from 'react';
import { View, Text } from 'react-native';

export const ProgressBar = ({ step, styles }) => (
  <View style={styles.progressContainer}>
    {[1, 2, 3].map((item, index) => (
      <React.Fragment key={item}>
        <View style={[styles.stepNode, step >= item ? styles.stepNodeActive : styles.stepNodeInactive]}>
          <Text style={[styles.stepNodeText, step >= item ? { color: '#fff' } : { color: '#b2bec3' }]}>{item}</Text>
        </View>
        {index < 2 && <View style={[styles.stepLine, step > item ? styles.stepLineActive : styles.stepLineInactive]} />}
      </React.Fragment>
    ))}
  </View>
);
