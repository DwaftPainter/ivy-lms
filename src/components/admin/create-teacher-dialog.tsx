"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTeacherInput } from "@/store/teacher.store";
import { IeltsSkill } from "@/generated/prisma/enums";

interface CreateTeacherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateTeacherInput) => Promise<void>;
    isLoading?: boolean;
}

const expertiseOptions = [
    { value: IeltsSkill.LISTENING, label: "Listening" },
    { value: IeltsSkill.READING, label: "Reading" },
    { value: IeltsSkill.WRITING, label: "Writing" },
    { value: IeltsSkill.SPEAKING, label: "Speaking" }
];

export function CreateTeacherDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading
}: CreateTeacherDialogProps) {
    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        bio: string;
        expertise: IeltsSkill[];
    }>({
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        expertise: []
    });

    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
    }>({});

    const validateForm = () => {
        const newErrors: { firstName?: string; lastName?: string; email?: string } =
            {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const data: CreateTeacherInput = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            bio: formData.bio.trim() || undefined,
            expertise: formData.expertise
        };

        await onSubmit(data);

        // Reset form after successful submission
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            bio: "",
            expertise: []
        });
    };

    const toggleExpertise = (skill: IeltsSkill) => {
        setFormData((prev) => ({
            ...prev,
            expertise: prev.expertise.includes(skill)
                ? prev.expertise.filter((s) => s !== skill)
                : [...prev.expertise, skill]
        }));
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when dialog is closed
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                bio: "",
                expertise: []
            });
            setErrors({});
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Teacher</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value
                                    })
                                }
                                placeholder="Enter first name"
                                disabled={isLoading}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500">
                                    {errors.firstName}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value
                                    })
                                }
                                placeholder="Enter last name"
                                disabled={isLoading}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500">
                                    {errors.lastName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="Enter email address"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                                setFormData({ ...formData, bio: e.target.value })
                            }
                            placeholder="Enter teacher bio (optional)"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Expertise</Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                            {expertiseOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={option.value}
                                        checked={formData.expertise.includes(
                                            option.value
                                        )}
                                        onCheckedChange={() =>
                                            toggleExpertise(option.value)
                                        }
                                        disabled={isLoading}
                                    />
                                    <Label
                                        htmlFor={option.value}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Teacher"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
