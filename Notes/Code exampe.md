---
created: 2023-03-08T17:32:40+03:00
modified: 2023-03-08T17:36:16+03:00
---

# Code exampe

```javascript
function parsePath(s: string): VdomPathParsed { 
   return ['']; 
 } 
  
 function parseText(s: string): VdomContent { 
   return {content: []}; 
 } 
  
 function parseTemplate(s: string): Vdom { 
   return new Vdom(); 
 } 
  
  
  
 type VdomStateListener = (after: any, before: any) => void; 
 // Every listener is in a path or managed by a mixin 
 type VdomPathParsed = (string | {ref: string})[]; 
 type VdomPath = {path: VdomPathParsed, listener: VdomStateListener}; 
  
 interface VdomContent { 
   content: Node[] | Vdom, 
   producer?: VdomPath // Path can point to (api) => Node[] 
 } 
  
 interface VdomAttrPart { 
   content: unknown, // Stringified if multiple 
   producer?: VdomPath // Result mapped via middleware state 
 } 
  
 class VdomState { 
   dom: HTMLElement; 
   content: VdomContent[] = []; 
   state: {[key: string]: unknown} = {}; 
   listeners: {[key: string]: VdomStateListener[]} = {}; 
   attrs: {[attr: string]: VdomAttrPart[]} = {}; 
  
   // Is this need - or is every change directly mirrored? 
   rerenderContent: boolean = false; 
    
   // ??? Expose api as state?? 
  
   setState = () => { 
     // Update state 
     // Call listeners 
     // Drill down into content Vdom 
   } 
  
   setAttr = (attr: string, value: unknown, {parse = false}) => { 
     if (parse) {} // parse as well? 
  
     // Produce listeners & detach old 
     //  - stringify if multiple 
     //  ? map via middleware states 
     //  - produce content or attr listeners 
  
     // Actually set the attribute 
   } 
  
   setContent = () => {} 
   addListener = () => {} 
 }
```
