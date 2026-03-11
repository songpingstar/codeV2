import { useState } from 'react';
import { ExecutionHistory } from './ExecutionHistory';
import { LogDetail } from './LogDetail';
import { ExecutionRecord } from './ExecutionHistory';

export function ExecutionRecords() {
  const [selectedRecord, setSelectedRecord] = useState<ExecutionRecord | null>(null);

  if (selectedRecord) {
    return (
      <LogDetail
        recordId={selectedRecord.id}
        initialRecord={selectedRecord}
        onBack={() => setSelectedRecord(null)}
      />
    );
  }

  return (
    <ExecutionHistory
      onViewLog={(record) => setSelectedRecord(record)}
    />
  );
}
