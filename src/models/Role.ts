import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  companyId: string;
  name: string;
  description: string;
  color: string; // Hex color for UI display
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  companyId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, default: '#6366f1' }, // Default indigo color
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Compound index to ensure unique role names per company
RoleSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
