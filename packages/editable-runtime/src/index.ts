/**
 * @objects/editable-runtime
 *
 * Runtime for visual editing in Objects Design Editor.
 * Include this in generated projects to enable click-to-select,
 * props editing, and visual controls.
 *
 * @example
 * ```tsx
 * import { EditableProvider, Editable } from '@objects/editable-runtime'
 *
 * function App() {
 *   return (
 *     <EditableProvider>
 *       <Editable
 *         id="hero-section"
 *         component={Hero}
 *         props={{ title: "Welcome", subtitle: "Build faster" }}
 *       />
 *     </EditableProvider>
 *   )
 * }
 * ```
 */

// Provider
export { EditableProvider, useEditable } from './EditableProvider';

// Components
export { Editable, withEditable, EditableText } from './Editable';

// Types
export type {
  EditableProps,
  EditableContextValue,
  EditableElementInfo,
  ElementRect,
  ParentToIframeMessage,
  IframeToParentMessage,
} from './types';
