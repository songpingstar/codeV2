import { useState } from 'react';
import { ExecutionHistory } from './ExecutionHistory';
import { LogDetail } from './LogDetail';

export function ExecutionRecords() {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  if (selectedRecordId) {
    return (
      <LogDetail
        recordId={selectedRecordId}
        onBack={() => setSelectedRecordId(null)}
      />
    );
  }

  return (
    <ExecutionHistory
      onViewLog={(recordId) => setSelectedRecordId(recordId)}
    />
  );
}
