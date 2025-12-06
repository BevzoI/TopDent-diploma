import { Box, Stack } from "rsuite";

export default function Field({ label, children }) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={10}
      style={{ marginBottom: 16 }}
    >
      <Box style={{ width: 120, color: "var(--rs-text-secondary)" }}>
        {label}
      </Box>
      <Box style={{ flex: 1 }}>{children}</Box>
    </Stack>
  );
}
