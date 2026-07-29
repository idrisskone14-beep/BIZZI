(function initBizziDataDedupe(root) {
  function dedupe(records = [], options = {}) {
    const keysFor = typeof options.keysFor === "function" ? options.keysFor : () => [];
    const mergeRecords = typeof options.mergeRecords === "function"
      ? options.mergeRecords
      : (preferred, duplicate) => ({ ...duplicate, ...preferred });
    const entries = [];
    const keyOwners = new Map();
    const aliases = new Map();

    (Array.isArray(records) ? records : []).filter(Boolean).forEach((record) => {
      const keys = [...new Set((keysFor(record) || []).filter(Boolean))];
      const owners = [...new Set(keys.map((key) => keyOwners.get(key)).filter((entry) => entry?.active))];
      if (!owners.length) {
        const entry = { active: true, value: record, keys: new Set(keys) };
        entries.push(entry);
        keys.forEach((key) => keyOwners.set(key, entry));
        return;
      }

      const primary = owners[0];
      primary.value = mergeRecords(primary.value, record);
      if (record.id && primary.value.id && record.id !== primary.value.id) aliases.set(String(record.id), String(primary.value.id));
      owners.slice(1).forEach((owner) => {
        primary.value = mergeRecords(primary.value, owner.value);
        if (owner.value.id && primary.value.id && owner.value.id !== primary.value.id) aliases.set(String(owner.value.id), String(primary.value.id));
        owner.active = false;
        owner.keys.forEach((key) => {
          primary.keys.add(key);
          keyOwners.set(key, primary);
        });
      });
      keys.forEach((key) => {
        primary.keys.add(key);
        keyOwners.set(key, primary);
      });
    });

    return {
      items: entries.filter((entry) => entry.active).map((entry) => entry.value),
      aliases,
    };
  }

  root.BizziDataDedupe = Object.freeze({ dedupe });
})(globalThis);
