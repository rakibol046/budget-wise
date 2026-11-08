import React, { useState } from "react";
import { Switch, View } from "react-native";
import { useApp } from "../state";
import {
  Button,
  Card,
  Choice,
  DeleteButton,
  Empty,
  ErrorMessage,
  Field,
  Label,
  layout,
  Screen,
  Sheet,
  useTask,
  useTheme,
} from "../ui";
import { colors } from "./Accounts";
import type { Category } from "../types";
function CategoryEditor({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const { request, refresh } = useApp();
  const task = useTask();
  const c = useTheme();
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "📦");
  const [color, setColor] = useState(category?.color || "#087f75");
  const save = () =>
    task.run(async () => {
      if (!name.trim()) throw new Error("Enter a category name.");
      await request(category ? `/categories/${category._id}` : "/categories", {
        method: category ? "PUT" : "POST",
        body: { name: name.trim(), icon: icon || "📦", color },
      });
      onClose();
      await refresh();
    });
  return (
    <Sheet
      visible
      title={category ? "Edit category" : "Create a category"}
      onClose={onClose}
      busy={task.busy}
    >
      <Field
        label="Category name"
        value={name}
        onChangeText={setName}
        maxLength={40}
        placeholder="Something you spend on"
      />
      <Field label="Emoji" value={icon} onChangeText={setIcon} maxLength={8} />
      <Choice
        label="Color"
        value={color}
        onChange={setColor}
        options={
          colors.some((option) => option.value === color)
            ? colors
            : [{ value: color, label: "Current color" }, ...colors]
        }
      />
      {category ? (
        <View style={layout.between}>
          <View style={layout.grow}>
            <Label>Available for new expenses</Label>
            <Label muted style={{ fontSize: 12 }}>
              Past expenses are kept when disabled.
            </Label>
          </View>
          <Switch
            accessibilityLabel="Category active"
            value={category.isActive}
            disabled={task.busy}
            trackColor={{ true: c.accent }}
            onValueChange={() =>
              void task.run(async () => {
                await request(`/categories/${category._id}/toggle`, {
                  method: "PATCH",
                });
                onClose();
                await refresh();
              })
            }
          />
        </View>
      ) : null}
      <ErrorMessage message={task.error} />
      <Button
        title="Save category"
        busy={task.busy}
        onPress={() => void save()}
      />
      {category ? (
        <DeleteButton
          title="Delete category"
          message="Delete this category? Categories used by expenses cannot be deleted."
          busy={task.busy}
          onDelete={() =>
            void task.run(async () => {
              await request(`/categories/${category._id}`, {
                method: "DELETE",
              });
              onClose();
              await refresh();
            })
          }
        />
      ) : null}
    </Sheet>
  );
}
export function CategoriesScreen() {
  const { data, loading, dataError } = useApp();
  const [editor, setEditor] = useState<{ category: Category | null } | null>(
    null,
  );
  return (
    <>
      <Screen>
        <View>
          <Label style={layout.title}>Your categories</Label>
          <Label muted>Organize spending in a way that feels like you.</Label>
        </View>
        <Button
          title="Create category"
          icon="add"
          disabled={loading || !!dataError}
          onPress={() => setEditor({ category: null })}
        />
        {data.categories.length ? (
          data.categories.map((category) => (
            <Card key={category._id}>
              <View style={layout.between}>
                <View style={layout.row}>
                  <View
                    style={{
                      backgroundColor: category.color + "20",
                      width: 45,
                      height: 45,
                      borderRadius: 13,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Label style={{ fontSize: 23 }}>{category.icon}</Label>
                  </View>
                  <View>
                    <Label style={{ fontWeight: "700" }}>{category.name}</Label>
                    <Label muted style={{ fontSize: 12 }}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Label>
                  </View>
                </View>
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={() => setEditor({ category })}
                />
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Empty
              title="Make it personal"
              message="Create categories for the things that matter to you."
            />
          </Card>
        )}
      </Screen>
      {editor ? (
        <CategoryEditor
          category={editor.category}
          onClose={() => setEditor(null)}
        />
      ) : null}
    </>
  );
}
