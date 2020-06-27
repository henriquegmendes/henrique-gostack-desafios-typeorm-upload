import csvParse from 'csvtojson';
import path from 'path';
import uploadConfig from '../config/upload';

interface ParsedData {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

export default async function loadCSV(fileName: string): Promise<ParsedData[]> {
  const filePath = path.join(uploadConfig.directory, fileName);

  const parsedData = await csvParse().fromFile(filePath);

  const transactionsData = parsedData.map(oneData => ({
    title: oneData.title,
    type: oneData.type,
    value: +oneData.value,
    category: oneData.category,
  }));

  return transactionsData;
}
