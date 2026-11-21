import { TacticalEditor } from '@/components/editor/TacticalEditor';

export const metadata = { title: 'Editor táctico · Football Tactical Studio' };

export default function EditorPage() {
  return (
    <>
      <h1 className="sr-only">Editor táctico</h1>
      <TacticalEditor />
    </>
  );
}
