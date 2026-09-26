/*
 * Stub definitions to satisfy Release mode linker symbols in React Native 0.87 (Fabric C++)
 */

#include <string>
#include <vector>
#include <memory>
#include <atomic>
#include <climits>

namespace facebook {
namespace react {

// --- Sealable ---
class Sealable {
public:
  Sealable();
  Sealable(const Sealable &other);
  Sealable(Sealable &&other) noexcept;
  virtual ~Sealable() noexcept;
  Sealable &operator=(const Sealable &other);
  Sealable &operator=(Sealable &&other) noexcept;
  void seal() const;
  bool getSealed() const;
  void ensureUnsealed() const;
private:
  mutable std::atomic<bool> sealed_{false};
};

Sealable::Sealable() : sealed_(false) {}
Sealable::Sealable(const Sealable &) : sealed_(false) {}
Sealable::Sealable(Sealable &&) noexcept : sealed_(false) {}
Sealable::~Sealable() noexcept = default;
Sealable &Sealable::operator=(const Sealable &) { return *this; }
Sealable &Sealable::operator=(Sealable &&) noexcept { return *this; }
void Sealable::seal() const { sealed_ = true; }
bool Sealable::getSealed() const { return sealed_; }
void Sealable::ensureUnsealed() const {}

// --- DebugStringConvertible ---
struct DebugStringConvertibleOptions {
  bool format{true};
  int depth{0};
  int maximumDepth{INT_MAX};
};

class DebugStringConvertible;
using SharedDebugStringConvertible = std::shared_ptr<const DebugStringConvertible>;
using SharedDebugStringConvertibleList = std::vector<SharedDebugStringConvertible>;

class DebugStringConvertible {
public:
  virtual ~DebugStringConvertible() = default;
  virtual std::string getDebugName() const;
  virtual std::string getDebugValue() const;
  virtual SharedDebugStringConvertibleList getDebugChildren() const;
  virtual SharedDebugStringConvertibleList getDebugProps() const;
  virtual std::string getDebugDescription(DebugStringConvertibleOptions options = {}) const;
  virtual std::string getDebugPropsDescription(DebugStringConvertibleOptions options = {}) const;
  virtual std::string getDebugChildrenDescription(DebugStringConvertibleOptions options = {}) const;
};

std::string DebugStringConvertible::getDebugName() const { return "Node"; }
std::string DebugStringConvertible::getDebugValue() const { return ""; }
SharedDebugStringConvertibleList DebugStringConvertible::getDebugChildren() const { return {}; }
SharedDebugStringConvertibleList DebugStringConvertible::getDebugProps() const { return {}; }
std::string DebugStringConvertible::getDebugDescription(DebugStringConvertibleOptions) const { return ""; }
std::string DebugStringConvertible::getDebugPropsDescription(DebugStringConvertibleOptions) const { return ""; }
std::string DebugStringConvertible::getDebugChildrenDescription(DebugStringConvertibleOptions) const { return ""; }

// --- Props & ViewProps ---
class Props : public virtual Sealable, public virtual DebugStringConvertible {
public:
  virtual SharedDebugStringConvertibleList getDebugProps() const override;
};

SharedDebugStringConvertibleList Props::getDebugProps() const { return {}; }

class BaseViewProps : public virtual Props {
public:
  virtual SharedDebugStringConvertibleList getDebugProps() const override;
};

SharedDebugStringConvertibleList BaseViewProps::getDebugProps() const { return {}; }

class YogaStylableProps : public virtual Props {
public:
  virtual SharedDebugStringConvertibleList getDebugProps() const override;
};

SharedDebugStringConvertibleList YogaStylableProps::getDebugProps() const { return {}; }

// --- ShadowNode & LayoutableShadowNode ---
class ShadowNode : public virtual Sealable, public virtual DebugStringConvertible {
public:
  virtual std::string getDebugName() const override;
  virtual std::string getDebugValue() const override;
  virtual SharedDebugStringConvertibleList getDebugChildren() const override;
};

std::string ShadowNode::getDebugName() const { return "ShadowNode"; }
std::string ShadowNode::getDebugValue() const { return ""; }
SharedDebugStringConvertibleList ShadowNode::getDebugChildren() const { return {}; }

class LayoutableShadowNode : public virtual ShadowNode {
public:
  virtual SharedDebugStringConvertibleList getDebugProps() const;
};

SharedDebugStringConvertibleList LayoutableShadowNode::getDebugProps() const { return {}; }

} // namespace react
} // namespace facebook
