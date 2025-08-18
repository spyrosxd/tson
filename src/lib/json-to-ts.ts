type Primitive = string | number | boolean | null;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toPascalCase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
    .replace(/^[0-9]+/, "");
}

const reservedNames = new Set(["Object", "Array", "String", "Number", "Boolean", "Type"]);

function uniqueTypeName(base: string, existing: Set<string>): string {
  let candidate = base || "Type";
  if (reservedNames.has(candidate)) candidate += "Type";
  if (!existing.has(candidate)) return candidate;
  let i = 2;
  while (existing.has(`${candidate}${i}`)) i++;
  return `${candidate}${i}`;
}

function inferPrimitiveType(value: Primitive): string {
  if (value === null) return "null";
  const t = typeof value;
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "unknown";
}

function mergeTypes(types: string[]): string[] {
  return Array.from(new Set(types)).sort();
}

export function jsonToTypescript(root: unknown, rootName = "Root"): string {
  const declarations: string[] = [];
  const declaredNames = new Set<string>();
  const shapeCache = new Map<string, string>(); 

  interface Resolved {
    typeRef: string;
  }

  function resolveArray(elements: unknown[], parentName: string): Resolved {
    if (elements.length === 0) {
      return { typeRef: "unknown[]" };
    }
  
    const elementTypes: string[] = [];
    for (const el of elements) {
      elementTypes.push(resolveValue(el, `${parentName}Item`).typeRef);
    }
  
    const union = mergeTypes(elementTypes).join(" | ");
    return { typeRef: `(${union})[]` };
  }
  
  function resolveObject(obj: Record<string, unknown>, nameHint: string): Resolved {
    const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    const shapeSignature = entries
      .map(([key, value]) => {
        const resolved = resolveValue(value, ""); // no nested nameHint to avoid recursion issues
        const optional = value === null || value === undefined ? "?" : "";
        return `${key}${optional}:${resolved.typeRef}`;
      })
      .join(";");

    // Reuse interface if same shape found
    if (shapeCache.has(shapeSignature)) {
      return { typeRef: shapeCache.get(shapeSignature)! };
    }

    // Generate unique interface name, avoid reserved words
    const interfaceName = uniqueTypeName(toPascalCase(nameHint || "Object"), declaredNames);
    declaredNames.add(interfaceName);
    shapeCache.set(shapeSignature, interfaceName);

    const lines: string[] = [];
    for (const [key, value] of entries) {
      const optional = value === null || value === undefined;
      // Pass more specific nested nameHint per property
      const resolved = resolveValue(value, `${interfaceName}${toPascalCase(key)}`);
      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : JSON.stringify(key);
      lines.push(`  ${safeKey}${optional ? "?" : ""}: ${resolved.typeRef};`);
    }

    declarations.push(`interface ${interfaceName} {\n${lines.join("\n")}\n}`);
    return { typeRef: interfaceName };
  }

  function resolveValue(value: unknown, nameHint: string): Resolved {
    if (value === null) return { typeRef: "null" };
    if (Array.isArray(value)) return resolveArray(value, nameHint);
    if (isPlainObject(value)) {
      const nextHint = nameHint || "Object";
      return resolveObject(value as Record<string, unknown>, nextHint);
    }

    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean") {
      return { typeRef: inferPrimitiveType(value as Primitive) };
    }
    return { typeRef: "unknown" };
  }

  const resolvedRoot = resolveValue(root, rootName);

  if (resolvedRoot.typeRef.match(/^[A-Z][A-Za-z0-9_]*$/)) {
    if (resolvedRoot.typeRef !== rootName) {
      declarations.push(`type ${uniqueTypeName(rootName, declaredNames)} = ${resolvedRoot.typeRef};`);
    }
  } else {
    declarations.push(`type ${uniqueTypeName(rootName, declaredNames)} = ${resolvedRoot.typeRef};`);
  }

  return declarations.join("\n\n").trim() + "\n";
}
