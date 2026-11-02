import { Avatar, AvatarStack } from "@plop-ui/react";

const crew = ["Jun Reyes", "Ana Cruz", "Rosa Santos", "Theo Park", "Mia Lopez"];

/** Avatar: doodle faces drawn from a name (the same name always gets the same face), with status and stacks. */
export function AvatarExample() {
  return (
    <>
      <Avatar name="Jun Reyes" status="online" />
      <Avatar name="Ana Cruz" status="busy" statusLabel="on a call" />
      <AvatarStack names={crew} max={3} />
    </>
  );
}
